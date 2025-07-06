import { ref, reactive } from "vue";
import type { UploadFile, UploadFilePersist } from "@/types";
import { saveUpload, getAllUploads, deleteUpload } from "../db/indexedDB";
import { Scheduler } from "../utils/scheduler";

// 配置
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_CONCURRENT_UPLOADS = 5;

export function useFileUpload() {
  const preparingFilesCount = ref(0);
  const uploads = reactive<
    Record<
      string,
      (UploadFile | UploadFilePersist) & {
        speed?: number;
        eta?: number;
        _lastUploadedSize?: number;
        _lastTimestamp?: number;
      }
    >
  >({});
  // 新增：待上传文件列表
  const selectedFiles = ref<File[]>([]);
  const fileInput = ref<HTMLInputElement | null>(null);
  const scheduler = new Scheduler(MAX_CONCURRENT_UPLOADS);
  const worker = new Worker(
    new URL("../workers/fileProcessor.worker.ts", import.meta.url),
    { type: "module" }
  );

  // 初始化时加载之前的上传
  const init = async () => {
    const savedUploads = await getAllUploads();
    savedUploads.forEach((upload) => {
      uploads[upload.id] = upload;
    });
  };

  // 文件选择变化处理方法
  // 选择文件后只存储，不直接上传
  const onFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      selectedFiles.value = Array.from(target.files as FileList);
      // 重置文件输入值，允许重复选择相同文件
      target.value = "";
    }
  };

  // 处理拖放事件
  const onFileDrop = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer?.files) {
      selectedFiles.value = Array.from(e.dataTransfer.files as FileList);
    }
  };

  // 处理文件选择
  const onFileSelect = () => {
    if (fileInput.value?.files) {
      selectedFiles.value = Array.from(fileInput.value.files as FileList);
    }
  };

  // 处理文件添加

  // 新增：点击按钮后开始上传所有已选文件
  const startSelectedUpload = () => {
    selectedFiles.value.forEach((file) => addFile(file));
    selectedFiles.value = [];
  };

  // 新增：单个文件上传
  const uploadSingleFile = (idx: number) => {
    const file = selectedFiles.value[idx];
    if (file) {
      addFile(file);
      selectedFiles.value.splice(idx, 1);
    }
  };

  // 添加新文件
  const addFile = async (file: File) => {
    preparingFilesCount.value++;
    // 先用 worker 计算 hash
    const tempWorker = new Worker(
      new URL("../workers/fileProcessor.worker.ts", import.meta.url),
      { type: "module" }
    );
    tempWorker.postMessage({ file, chunkSize: CHUNK_SIZE });
    let fileHash = "";
    let chunks: any[] = [];
    await new Promise<void>((resolve) => {
      tempWorker.onmessage = (e) => {
        if (e.data.type === "complete") {
          fileHash = e.data.fileHash;
          chunks = e.data.chunks;
          resolve();
        }
      };
    });
    tempWorker.terminate();
    preparingFilesCount.value--;

    // 秒传：请求后端 hash 检查
    const checkRes = await fetch("/api/check-file", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileHash, fileName: file.name }),
    });
    const checkData = await checkRes.json();
    const id = `${file.name}-${file.size}-${Date.now()}`;
    if (checkData.exists) {
      // 直接标记为已完成
      uploads[id] = {
        id,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        hash: fileHash,
        chunks: [],
        status: "completed",
        progress: 100,
        uploadedSize: file.size,
      };
      saveUpload(uploads[id] as UploadFile);
      return;
    }

    // 查询已上传分片列表
    let uploadedChunks: number[] = [];
    try {
      const chunkRes = await fetch(
        `/api/uploaded-chunks?fileId=${encodeURIComponent(fileHash)}`
      );
      if (chunkRes.ok) {
        const chunkData = await chunkRes.json();
        uploadedChunks = chunkData.uploadedChunks || [];
      }
    } catch (e) {
      // 网络异常可忽略，全部视为未上传
    }

    // 标记分片状态
    chunks = chunks.map((chunk: any) => ({
      ...chunk,
      status: uploadedChunks.includes(chunk.index) ? "completed" : "pending",
    }));

    // 统计已上传大小和进度
    const uploadedSize = chunks
      .filter((c: any) => c.status === "completed")
      .reduce((sum: number, c: any) => sum + c.size, 0);
    const progress = Math.round((uploadedSize / file.size) * 100);

    const uploadFile: UploadFile = {
      id,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      hash: fileHash,
      chunks,
      status: progress === 100 ? "completed" : "pending",
      progress,
      uploadedSize,
    };
    uploads[id] = uploadFile;
    saveUpload(uploadFile);
    if (progress < 100) {
      processFile(id, file);
    }
  };

  // Web Worker处理文件
  const processFile = (id: string, file: File) => {
    worker.postMessage({ file, chunkSize: CHUNK_SIZE });

    worker.onmessage = (e) => {
      if (e.data.type === "progress") {
        // 更新分片处理进度
        const progress = Math.round(e.data.progress);
        uploads[id].progress = progress;
      } else if (e.data.type === "complete") {
        // 文件处理完成
        uploads[id] = {
          ...uploads[id],
          hash: e.data.fileHash,
          chunks: e.data.chunks,
          status: "uploading",
        };
        if ("file" in uploads[id]) {
          saveUpload(uploads[id] as UploadFile);
        }
        startUpload(id);
      }
    };
  };

  // 开始上传
  const startUpload = async (id: string) => {
    const fileData = uploads[id];
    // 初始化测速相关字段
    fileData._lastUploadedSize = fileData.uploadedSize;
    fileData._lastTimestamp = Date.now();
    fileData.speed = 0;
    fileData.eta = 0;
    fileData.chunks
      .filter(
        (chunk) => chunk.status === "pending" || chunk.status === "failed"
      )
      .forEach((chunk) => {
        // 以 fileId-分片index 作为任务key，便于移除
        scheduler.add(
          () => uploadChunk(id, chunk.index),
          `${id}-${chunk.index}`
        );
      });
    // 启动定时器刷新速度和剩余时间
    if (!(fileData as any)._timer) {
      (fileData as any)._timer = setInterval(() => {
        updateSpeedAndEta(id);
      }, 1000);
    }
  };

  // 刷新速度和剩余时间
  const updateSpeedAndEta = (id: string) => {
    const fileData = uploads[id];
    const now = Date.now();
    const deltaSize = fileData.uploadedSize - (fileData._lastUploadedSize || 0);
    const deltaTime = (now - (fileData._lastTimestamp || now)) / 1000;
    fileData.speed = deltaTime > 0 ? deltaSize / deltaTime : 0;
    fileData.eta =
      fileData.speed > 0
        ? Math.ceil((fileData.size - fileData.uploadedSize) / fileData.speed)
        : 0;
    fileData._lastUploadedSize = fileData.uploadedSize;
    fileData._lastTimestamp = now;
    // 上传完成后清理定时器
    if (fileData.progress === 100 && (fileData as any)._timer) {
      clearInterval((fileData as any)._timer);
      (fileData as any)._timer = null;
    }
  };

  // 上传单个分片
  const MAX_RETRY = 3;
  const uploadChunk = async (fileId: string, chunkIndex: number, retry = 0) => {
    const fileData = uploads[fileId];
    const chunk = fileData.chunks[chunkIndex];

    // 只处理有 file 字段的上传
    if (!("file" in fileData)) return;

    try {
      chunk.status = "uploading";

      const formData = new FormData();
      formData.append("fileId", fileId);
      formData.append("chunkIndex", String(chunkIndex));
      formData.append("chunkHash", chunk.hash);
      const blob = fileData.file.slice(chunk.start, chunk.end);
      formData.append("chunkData", blob, `${fileData.name}.part${chunkIndex}`);

      // 实际API请求
      const response = await fetch("/api/upload-chunk", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Chunk upload failed");
      const resData = await response.json();
      // 分片校验：校验返回的size/hash等
      if (resData.size !== chunk.size /* 可扩展hash校验 */) {
        throw new Error("Chunk size mismatch");
      }

      chunk.status = "completed";
      fileData.uploadedSize = fileData.chunks.reduce(
        (sum, c) => sum + (c.status === "completed" ? c.size : 0),
        0
      );
      fileData.progress = Math.round(
        (fileData.uploadedSize / fileData.size) * 100
      );
      updateSpeedAndEta(fileId);
      // 检查是否所有分片都上传完成
      if (fileData.progress === 100) {
        fileData.status = "completed";
        if ((fileData as any)._timer) {
          clearInterval((fileData as any)._timer);
          (fileData as any)._timer = null;
        }
        completeUpload(fileId);
      }
      saveUpload(fileData as UploadFile);
    } catch (error) {
      console.error(`Upload chunk failed (try ${retry + 1}):`, error);
      if (retry < MAX_RETRY - 1) {
        // 失败重试
        setTimeout(
          () => uploadChunk(fileId, chunkIndex, retry + 1),
          1000 * (retry + 1)
        );
      } else {
        chunk.status = "failed";
        saveUpload(fileData as UploadFile);
      }
    }
  };

  // 完成上传
  const completeUpload = async (fileId: string) => {
    const fileData = uploads[fileId];

    try {
      // 传 fileHash 参与后端合并校验
      await fetch("/api/complete-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: fileData.id,
          fileName: fileData.name,
          chunks: fileData.chunks.length,
          fileHash: fileData.hash,
        }),
      });

      // 上传完成后从IndexedDB中删除记录
      await deleteUpload(fileId);
      // 新增：上传完成后自动移除 uploads 列表
      delete uploads[fileId];
    } catch (error) {
      console.error("Complete upload failed:", error);
    }
  };

  // 暂停上传
  const pauseUpload = (fileId: string) => {
    const fileData = uploads[fileId];
    fileData.status = "paused";
    // 移除调度队列中该文件所有未完成分片任务
    fileData.chunks.forEach((chunk) => {
      if (chunk.status === "pending" || chunk.status === "failed") {
        scheduler.removeByKey(`${fileId}-${chunk.index}`);
      }
    });
    if ("file" in fileData) {
      saveUpload(fileData as UploadFile);
    }
  };

  // 恢复上传
  const resumeUpload = (fileId: string) => {
    const fileData = uploads[fileId];
    fileData.status = "uploading";
    if ("file" in fileData) {
      saveUpload(fileData as UploadFile);
    }
    // 重新调度所有未完成分片
    startUpload(fileId);
  };

  // 删除上传
  const removeUpload = async (fileId: string) => {
    await deleteUpload(fileId);
    delete uploads[fileId];
  };

  // 手动重试单个分片
  const retryChunk = (fileId: string, chunkIndex: number) => {
    const fileData = uploads[fileId];
    const chunk = fileData.chunks[chunkIndex];
    if (chunk.status === "failed") {
      chunk.status = "pending";
      if ("file" in fileData) {
        saveUpload(fileData as UploadFile);
      }
      scheduler.add(
        () => uploadChunk(fileId, chunkIndex),
        `${fileId}-${chunkIndex}`
      );
    }
  };

  return {
    uploads,
    fileInput,
    init,
    selectedFiles,
    startSelectedUpload,
    uploadSingleFile,
    preparingFilesCount,
    onFileDrop,
    onFileChange,
    onFileSelect,
    pauseUpload,
    resumeUpload,
    removeUpload,
    retryChunk,
  };
}

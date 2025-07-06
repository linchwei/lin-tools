import type { FileChunk } from "@/types";

// sha1 hash util
async function sha1(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-1", buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// 文件分片处理
self.onmessage = async (e: MessageEvent) => {
  const { file, chunkSize } = e.data;

  const chunks: FileChunk[] = [];
  const totalChunks = Math.ceil(file.size / chunkSize);

  // 处理每个分片
  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);

    // 计算分片sha1
    const arrayBuffer = await chunk.arrayBuffer();
    const hash = await sha1(arrayBuffer);

    chunks.push({
      index: i,
      start,
      end,
      hash,
      size: end - start,
      status: "pending",
    });

    // 通知主线程进度
    self.postMessage({
      type: "progress",
      index: i,
      total: totalChunks,
      progress: ((i + 1) / totalChunks) * 100,
    });
  }

  // 计算文件整体sha1
  const fileBuffer = await file.arrayBuffer();
  const fileHash = await sha1(fileBuffer);

  self.postMessage({
    type: "complete",
    fileHash,
    chunks,
  });
};

import Router from "@koa/router";
import path from "path";
import { UPLOAD_DIR } from "../constants";
import fs from "fs-extra";
import crypto from "crypto";
import type { Context } from "koa";

const router = new Router();

// 分片上传接口
router.post("/upload-chunk", async (ctx: Context) => {
  const { fileId, chunkIndex, chunkHash } = ctx.request.body as {
    fileId: string;
    chunkIndex: string;
    chunkHash: string;
  };

  // console.log("🚀 ~ router.post ~ chunkHash:", ctx.request.body);
  // console.log("🚀 ~ router.post ~ chunkIndex:", ctx.request.files);

  // 兼容单文件/多文件，必须从 ctx.request.files 获取
  const fileField = ctx.request.files?.chunkData;
  const file = Array.isArray(fileField) ? fileField[0] : fileField;
  // formidable v2+ PersistentFile 用 filepath，不是 path
  if (!fileId || !file || !(file as any).filepath || chunkIndex === undefined) {
    ctx.status = 400;
    ctx.body = {
      error: "参数缺失",
      fileId,
      file: file
        ? {
            originalFilename: (file as any).originalFilename,
            filepath: (file as any).filepath,
            size: (file as any).size,
            mimetype: (file as any).mimetype,
          }
        : file,
      chunkIndex,
      chunkHash,
      files: ctx.request.files,
      body: ctx.request.body,
    };
    return;
  }
  const chunkDir = path.join(UPLOAD_DIR, fileId);
  await fs.ensureDir(chunkDir);
  const chunkPath = path.join(chunkDir, chunkIndex);
  await fs.move((file as any).filepath, chunkPath, { overwrite: true });
  // 分片 hash 校验
  const stat = await fs.stat(chunkPath);
  const buffer = await fs.readFile(chunkPath);
  const serverHash = crypto.createHash("sha1").update(buffer).digest("hex");
  if (serverHash !== chunkHash) {
    ctx.status = 400;
    ctx.body = {
      error: "分片 hash 校验失败",
      chunkIndex,
      chunkHash,
      serverHash,
    };
    await fs.remove(chunkPath);
    return;
  }
  ctx.body = { success: true, size: stat.size, chunkIndex, chunkHash };
});

// 合并分片接口
router.post("/complete-upload", async (ctx: Context) => {
  const { fileId, fileName, chunks } = ctx.request.body as {
    fileId: string;
    fileName: string;
    chunks: number;
  };
  if (!fileId || !fileName || !chunks) {
    ctx.status = 400;
    ctx.body = { error: "参数缺失" };
    return;
  }
  const chunkDir = path.join(UPLOAD_DIR, fileId);
  const filePath = path.join(UPLOAD_DIR, fileName);
  const writeStream = fs.createWriteStream(filePath);
  try {
    // 合并文件
    for (let i = 0; i < chunks; i++) {
      const chunkPath = path.join(chunkDir, String(i));
      if (await fs.pathExists(chunkPath)) {
        await new Promise<void>((resolve) => {
          const readStream = fs.createReadStream(chunkPath);
          readStream.pipe(writeStream, { end: false });
          readStream.on("end", resolve);
        });
        await fs.remove(chunkPath);
      } else {
        ctx.status = 400;
        ctx.body = { error: `缺少分片${i}` };
        return;
      }
    }
    writeStream.end();
    await new Promise<void>((resolve) =>
      writeStream.on("finish", () => resolve())
    );
    // 合并后 hash 校验
    const mergedBuffer = await fs.readFile(filePath);
    const mergedHash = crypto
      .createHash("sha1")
      .update(mergedBuffer)
      .digest("hex");
    // 前端需传 fileHash
    const { fileHash } = ctx.request.body as { fileHash?: string };
    if (fileHash && mergedHash !== fileHash) {
      ctx.status = 400;
      ctx.body = { error: "合并后文件 hash 校验失败", mergedHash, fileHash };
      await fs.remove(filePath);
      return;
    }
    // 合并成功后清理分片目录及所有残留分片
    try {
      await fs.remove(chunkDir);
    } catch (e) {
      // 忽略清理异常，保证主流程不受影响
      console.warn("清理分片目录失败:", e);
    }
    ctx.body = { success: true, filePath, mergedHash };
  } catch (err) {
    ctx.status = 500;
    ctx.body = { error: "合并失败", detail: String(err) };
  }
});

// 查询已上传分片列表接口
router.get("/uploaded-chunks", async (ctx: Context) => {
  const { fileId } = ctx.query as { fileId?: string };
  if (!fileId) {
    ctx.status = 400;
    ctx.body = { error: "fileId参数缺失" };
    return;
  }
  const chunkDir = path.join(UPLOAD_DIR, fileId);
  let uploaded: number[] = [];
  if (await fs.pathExists(chunkDir)) {
    const files = await fs.readdir(chunkDir);
    uploaded = files
      .map((name) => parseInt(name))
      .filter((n) => !isNaN(n))
      .sort((a, b) => a - b);
  }
  ctx.body = { uploadedChunks: uploaded };
});

export default router;

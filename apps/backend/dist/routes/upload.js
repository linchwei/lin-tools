"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = __importDefault(require("@koa/router"));
const koa_body_1 = __importDefault(require("koa-body"));
const path_1 = __importDefault(require("path"));
const constants_1 = require("../constants");
const fs_extra_1 = __importDefault(require("fs-extra"));
const crypto_1 = __importDefault(require("crypto"));
const router = new router_1.default();
// 分片上传接口
router.post("/upload-chunk", (0, koa_body_1.default)({ multipart: true }), async (ctx) => {
    const { fileId, chunkIndex, chunkHash } = ctx.request.body;
    const file = ctx.request.files?.chunkData;
    if (!fileId || !file || chunkIndex === undefined) {
        ctx.status = 400;
        ctx.body = { error: "参数缺失" };
        return;
    }
    const chunkDir = path_1.default.join(constants_1.UPLOAD_DIR, fileId);
    await fs_extra_1.default.ensureDir(chunkDir);
    const chunkPath = path_1.default.join(chunkDir, chunkIndex);
    await fs_extra_1.default.move(file.path, chunkPath, { overwrite: true });
    // 分片 hash 校验
    const stat = await fs_extra_1.default.stat(chunkPath);
    const buffer = await fs_extra_1.default.readFile(chunkPath);
    const serverHash = crypto_1.default.createHash("sha1").update(buffer).digest("hex");
    if (serverHash !== chunkHash) {
        ctx.status = 400;
        ctx.body = {
            error: "分片 hash 校验失败",
            chunkIndex,
            chunkHash,
            serverHash,
        };
        await fs_extra_1.default.remove(chunkPath);
        return;
    }
    ctx.body = { success: true, size: stat.size, chunkIndex, chunkHash };
});
// 合并分片接口
router.post("/complete-upload", (0, koa_body_1.default)(), async (ctx) => {
    const { fileId, fileName, chunks } = ctx.request.body;
    if (!fileId || !fileName || !chunks) {
        ctx.status = 400;
        ctx.body = { error: "参数缺失" };
        return;
    }
    const chunkDir = path_1.default.join(constants_1.UPLOAD_DIR, fileId);
    const filePath = path_1.default.join(constants_1.UPLOAD_DIR, fileName);
    const writeStream = fs_extra_1.default.createWriteStream(filePath);
    try {
        // 合并文件
        for (let i = 0; i < chunks; i++) {
            const chunkPath = path_1.default.join(chunkDir, String(i));
            if (await fs_extra_1.default.pathExists(chunkPath)) {
                await new Promise((resolve) => {
                    const readStream = fs_extra_1.default.createReadStream(chunkPath);
                    readStream.pipe(writeStream, { end: false });
                    readStream.on("end", resolve);
                });
                await fs_extra_1.default.remove(chunkPath);
            }
            else {
                ctx.status = 400;
                ctx.body = { error: `缺少分片${i}` };
                return;
            }
        }
        writeStream.end();
        await new Promise((resolve) => writeStream.on("finish", () => resolve()));
        // 合并后 hash 校验
        const mergedBuffer = await fs_extra_1.default.readFile(filePath);
        const mergedHash = crypto_1.default
            .createHash("sha1")
            .update(mergedBuffer)
            .digest("hex");
        // 前端需传 fileHash
        const { fileHash } = ctx.request.body;
        if (fileHash && mergedHash !== fileHash) {
            ctx.status = 400;
            ctx.body = { error: "合并后文件 hash 校验失败", mergedHash, fileHash };
            await fs_extra_1.default.remove(filePath);
            return;
        }
        await fs_extra_1.default.remove(chunkDir);
        ctx.body = { success: true, filePath, mergedHash };
    }
    catch (err) {
        ctx.status = 500;
        ctx.body = { error: "合并失败", detail: String(err) };
    }
});
// 查询已上传分片列表接口
router.get("/uploaded-chunks", async (ctx) => {
    const { fileId } = ctx.query;
    if (!fileId) {
        ctx.status = 400;
        ctx.body = { error: "fileId参数缺失" };
        return;
    }
    const chunkDir = path_1.default.join(constants_1.UPLOAD_DIR, fileId);
    let uploaded = [];
    if (await fs_extra_1.default.pathExists(chunkDir)) {
        const files = await fs_extra_1.default.readdir(chunkDir);
        uploaded = files
            .map((name) => parseInt(name))
            .filter((n) => !isNaN(n))
            .sort((a, b) => a - b);
    }
    ctx.body = { uploadedChunks: uploaded };
});
exports.default = router;

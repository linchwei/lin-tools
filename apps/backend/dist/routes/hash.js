"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = __importDefault(require("@koa/router"));
const koa_body_1 = __importDefault(require("koa-body"));
const constants_1 = require("../constants");
const fs_extra_1 = __importDefault(require("fs-extra"));
const router = new router_1.default();
// 检查文件hash是否已存在
router.post("/check-file", (0, koa_body_1.default)(), async (ctx) => {
    const { fileHash, fileName } = ctx.request.body;
    if (!fileHash || !fileName) {
        ctx.status = 400;
        ctx.body = { exists: false, error: "参数缺失" };
        return;
    }
    // 假设服务端保存的文件名为 hash+原始文件名
    const files = await fs_extra_1.default.readdir(constants_1.UPLOAD_DIR);
    const exists = files.some((f) => f.startsWith(fileHash));
    ctx.body = { exists };
});
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const cors_1 = __importDefault(require("@koa/cors"));
const koa_body_1 = __importDefault(require("koa-body"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const constants_1 = require("./constants");
const client_1 = require("@prisma/client");
const upload_1 = __importDefault(require("./routes/upload"));
const hash_1 = __importDefault(require("./routes/hash"));
const app = new koa_1.default();
// const router = new Router(); // 移除未用 router，避免类型冲突
const prisma = new client_1.PrismaClient();
// 确保上传目录存在
fs_extra_1.default.ensureDirSync(constants_1.UPLOAD_DIR);
// 配置中间件
app.use((0, cors_1.default)());
app.use((0, koa_body_1.default)({
    multipart: true,
    formidable: {
        uploadDir: constants_1.UPLOAD_DIR,
        keepExtensions: true,
    },
}));
// 只注册 uploadRouter 和 hashRouter，避免类型冲突
app.use(upload_1.default.routes());
app.use(upload_1.default.allowedMethods());
app.use(hash_1.default.routes());
app.use(hash_1.default.allowedMethods());
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

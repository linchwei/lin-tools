import Koa from "koa";
import Router from "@koa/router";
// @ts-ignore
import cors from "@koa/cors";
import bodyParser from "koa-body";
import multer from "multer";
import fs from "fs-extra";
import { UPLOAD_DIR } from "./constants";
import { PrismaClient } from "@prisma/client";
import uploadRouter from "./routes/upload";
import hashRouter from "./routes/hash";
import bigdataRouter from "./routes/bigdata";

const app = new Koa();

// 全局错误处理中间件，保证所有异常都返回 JSON
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    const error = err as any;
    ctx.status = error.statusCode || error.status || 500;
    ctx.body = { message: error.message };
    // 可选：console.error(error)
  }
});
// const router = new Router(); // 移除未用 router，避免类型冲突
const prisma = new PrismaClient();
// 确保上传目录存在
fs.ensureDirSync(UPLOAD_DIR);

// 配置中间件
app.use(cors());
app.use(
  bodyParser({
    multipart: true,
    formidable: {
      uploadDir: UPLOAD_DIR,
      keepExtensions: true,
    },
  })
);

app.use(uploadRouter.routes());
app.use(uploadRouter.allowedMethods());
app.use(hashRouter.routes());
app.use(hashRouter.allowedMethods());
app.use(bigdataRouter.routes());
app.use(bigdataRouter.allowedMethods());

// 404 兜底中间件，所有未命中路由返回 JSON
app.use(async (ctx) => {
  ctx.status = 404;
  ctx.body = { message: "Not Found" };
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

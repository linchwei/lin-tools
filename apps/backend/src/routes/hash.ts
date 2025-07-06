import Router from "@koa/router";
import path from "path";
import { UPLOAD_DIR } from "../constants";
import fs from "fs-extra";

const router = new Router();

// 检查文件hash是否已存在
router.post("/check-file", async (ctx) => {
  try {
    const { fileHash, fileName } = ctx.request.body as {
      fileHash: string;
      fileName: string;
    };
    if (!fileHash || !fileName) {
      ctx.status = 400;
      ctx.body = { exists: false, error: "参数缺失" };
      return;
    }
    const files = await fs.readdir(UPLOAD_DIR);
    const exists = files.some((f) => f.startsWith(fileHash));
    ctx.body = { exists };
  } catch (err) {
    ctx.status = 500;
    ctx.body = {
      exists: false,
      error: (err as Error).message || "Internal Server Error",
    };
  }
});

export default router;

import Router from "@koa/router";
import type { Context } from "koa";

const router = new Router();

// 生成10w+条大数据
router.get("/bigdata", async (ctx: Context) => {
  const count = Number(ctx.query.count) || 100000;
  const data = Array.from({ length: count }, (_, i) => ({
    name: `用户${i + 1}`,
    age: Math.floor(Math.random() * 60) + 18,
    desc: `这是第${i + 1}个用户的描述信息，随机数：${Math.random().toFixed(6)}`,
  }));
  ctx.body = { data };
});

export default router;

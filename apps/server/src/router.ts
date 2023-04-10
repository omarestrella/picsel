import { Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { redis } from "./redis.ts";

export const router = new Router();

router.get("/health", async (ctx) => {
  const response = await redis.echo("Ok");
  ctx.response.body = response;
  ctx.response.status = 200;
});

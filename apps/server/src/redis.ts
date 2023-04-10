import { connect, type Redis } from "https://deno.land/x/redis@v0.29.2/mod.ts";

export const redis = await connect({
  hostname: Deno.env.get("REDIS_HOST") ?? "localhost",
  password: Deno.env.get("REDIS_PASSWORD") ?? "",
  port: 6379,
});

export type { Redis };

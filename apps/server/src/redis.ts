import { connect, type Redis } from "https://deno.land/x/redis@v0.29.2/mod.ts";

export const redis = await connect({
  hostname: "127.0.0.1",
  port: 6379,
});

export type { Redis };

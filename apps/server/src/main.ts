import { Application } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { load } from "https://deno.land/std@0.180.0/dotenv/mod.ts";
import logger from "https://deno.land/x/oak_logger@1.0.0/mod.ts";
import { router } from "./documents/router.ts";

await load();

const app = new Application();

app.use(logger.logger);
app.use(logger.responseTime);

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 4000 });

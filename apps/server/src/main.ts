import { Application } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import logger from "https://deno.land/x/oak_logger@1.0.0/mod.ts";
import { router } from "./documents/router.ts";
import { router as appRouter } from "./router.ts";

const app = new Application();

app.use(logger.logger);
app.use(logger.responseTime);

app.use(router.routes());
app.use(router.allowedMethods());

app.use(appRouter.routes());
app.use(appRouter.allowedMethods());

await app.listen({ port: 4000 });

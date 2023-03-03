import { Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { DocumentsService } from "./service.ts";
import { redis } from "../redis.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { DocumentsGateway } from "./gateway.ts";

const documentsService = new DocumentsService(redis);
const documentsGateway = new DocumentsGateway(documentsService);

export const router = new Router({
  prefix: "/documents",
});

router
  .get("/:id", oakCors(), async (context) => {
    const documentData = await documentsService.getDocumentData(
      context.params.id
    );
    context.response.body = documentData;
  })
  .get("/:id/sync", (context) => {
    if (!context.isUpgradable) {
      context.throw(500);
    } else {
      const ws = context.upgrade();
      documentsGateway.onConnect(
        ws,
        context.params.id,
        context.request.url.searchParams.get("actorID")
      );
    }
  });

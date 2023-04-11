import { Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { DocumentsService } from "./service.ts";
import { redis } from "../redis.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import { DocumentsGateway } from "./gateway.ts";
import { Automerge } from "../automerge.ts";

const documentsService = new DocumentsService(redis);
const documentsGateway = new DocumentsGateway(redis, documentsService);

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
  .get("/:id/preview", async (context) => {
    const owner = context.request.url.searchParams.get("owner");
    if (owner) {
      const doc = await documentsService.getDocument(owner, context.params.id);
      context.response.status = 200;
      context.response.body = Automerge.toJS(doc) as Record<string, unknown>;
    } else {
      context.response.status = 404;
      context.response.body = "Not found";
    }
  })
  .get("/:id/sync", async (context) => {
    if (!context.isUpgradable) {
      context.throw(500);
    } else {
      const ws = context.upgrade();
      await documentsGateway.onConnect(
        ws,
        context.params.id,
        context.request.url.searchParams.get("email"),
        context.request.url.searchParams.get("actorID")
      );
    }
  });

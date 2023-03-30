import type { Project } from "@packages/shared/types.ts";
import { Automerge } from "../automerge.ts";
import { Logger } from "../logger.ts";
import { Redis } from "../redis.ts";
import { debounce } from "https://deno.land/std@0.181.0/async/mod.ts";
import { getProjectData, writeProjectData } from "../db.ts";

type DocumentID = string;

export class DocumentsService {
  documents = new Map<DocumentID, Automerge.Doc<unknown>>();
  logger = new Logger("DocumentsService");

  constructor(readonly redis: Redis) {}

  public async getDocument(owner: string, documentID: string) {
    if (this.documents.has(documentID)) {
      return this.documents.get(documentID)!;
    }

    const documentData = await this.redis.sendCommand("GET", documentID);
    let data: Uint8Array;
    if (documentData.buffer()?.length) {
      data = Uint8Array.from(documentData.buffer());
    } else {
      data = await getProjectData(owner, documentID);
    }

    const document = Automerge.load(data);
    await this.redis.set(documentID, Automerge.save(document));
    this.documents.set(documentID, document);

    return document;
  }

  public async getDocumentData(documentID: string) {
    const haveDocument = await this.redis.exists(documentID);
    const documentData = await this.redis.sendCommand("GET", documentID);
    if (!!haveDocument && documentData) {
      return Uint8Array.from(documentData.buffer());
    } else {
      return null;
    }
  }

  public async saveDocument(
    owner: string,
    documentID: string,
    document: Automerge.Doc<unknown>
  ) {
    await this.redis.set(documentID, Automerge.save(document));
    this.documents.set(documentID, document);

    this.updateStoredDocument(owner, documentID);
  }

  public async clearLocalCache(documentID: string) {
    this.documents.delete(documentID);
    await this.redis.del(documentID);
  }

  updateStoredDocument = debounce(async (owner: string, documentID: string) => {
    this.logger.log("Uploading document");
    const documentData = await this.redis.sendCommand("GET", documentID);
    if (documentData.buffer()?.length) {
      await writeProjectData(owner, documentID, documentData.buffer());
    }
  }, 1000);
}

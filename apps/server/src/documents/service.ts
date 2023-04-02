import type { Project } from "@packages/shared/api.ts";
import { Automerge } from "../automerge.ts";
import { Logger } from "../logger.ts";
import { Redis } from "../redis.ts";
import {
  getProjectData,
  getProjectForDocumentID,
  writeProjectData,
} from "../db.ts";

type DocumentID = string;

export class DocumentsService {
  projects = new Map<string, Project>();
  logger = new Logger("DocumentsService");

  constructor(readonly redis: Redis) {}

  async getProject(documentID: string): Promise<Project> {
    if (this.projects.has(documentID)) {
      return this.projects.get(documentID)!;
    } else {
      return (await getProjectForDocumentID(documentID)) as Project;
    }
  }

  async getDocument(owner: string, documentID: string) {
    const documentData = await this.redis.sendCommand("GET", documentID);
    let data: Uint8Array;
    if (documentData.buffer()?.length) {
      data = Uint8Array.from(documentData.buffer());
    } else {
      data = await getProjectData(owner, documentID);
    }

    const document = Automerge.load(data);
    await this.redis.set(documentID, Automerge.save(document));

    return document;
  }

  async getDocumentData(documentID: string) {
    const haveDocument = await this.redis.exists(documentID);
    const documentData = await this.redis.sendCommand("GET", documentID);
    if (!!haveDocument && documentData) {
      return Uint8Array.from(documentData.buffer());
    } else {
      return null;
    }
  }

  async markDocumentDirty(documentID: string) {
    await this.redis.set(`${documentID}/dirty`, 1);
  }

  async isDocumentDirty(documentID: string) {
    const data = await this.redis.sendCommand("GET", `${documentID}/dirty`);
    return data.integer() === 1;
  }

  async saveDocument(
    owner: string,
    documentID: string,
    document: Automerge.Doc<unknown>
  ) {
    await this.markDocumentDirty(documentID);

    const data = Automerge.save(document);
    await Promise.allSettled([
      this.redis.set(documentID, data),
      this.updateStoredDocument(owner, documentID, data),
    ]);
  }

  async clearLocalCache(documentID: string) {
    await this.redis.del(documentID);
  }

  private async updateStoredDocument(
    owner: string,
    documentID: string,
    data: Uint8Array
  ) {
    this.logger.log("Uploading document");
    const documentData = await this.redis.sendCommand("GET", documentID);
    if (documentData.buffer()?.length) {
      await writeProjectData(owner, documentID, data);
    }
  }
}

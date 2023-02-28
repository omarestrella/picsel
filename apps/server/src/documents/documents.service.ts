import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { Injectable, Logger } from '@nestjs/common';
import * as Automerge from '@automerge/automerge';
import { Project } from '@packages/shared/types';

type DocumentID = string;

@Injectable()
export class DocumentsService {
  documents = new Map<DocumentID, Automerge.Doc<unknown>>();
  logger = new Logger();

  constructor(@InjectRedis() private readonly redis: Redis) {}

  // going to fake reading the document
  // ideally it can store permanent in redis or sql or something
  public async getDocument(documentID: string) {
    if (this.documents.has(documentID)) {
      return this.documents.get(documentID);
    }
    let document: Automerge.Doc<unknown>;
    const documentData = await this.redis.getBuffer(documentID);
    if (documentData) {
      const data = Uint8Array.from(documentData);
      document = Automerge.load(data);
    } else {
      document = Automerge.from<Project>({
        id: documentID,
        layers: [],
        name: 'Test Name',
        size: {
          width: 16,
          height: 16,
        },
      } as Project);
      await this.saveDocument(documentID, document);
    }

    return document;
  }

  public async getDocumentData(documentID: string) {
    const documentData = await this.redis.getBuffer(documentID);
    if (documentData) {
      return Uint8Array.from(documentData);
    } else {
      this.logger.log('Creating new document on demand');
      const doc = await this.getDocument(documentID);
      return Automerge.save(doc);
    }
  }

  public async saveDocument(
    documentID: string,
    document: Automerge.Doc<unknown>,
  ) {
    await this.redis.set(documentID, Buffer.from(Automerge.save(document)));
    this.documents.set(documentID, document);
  }
}

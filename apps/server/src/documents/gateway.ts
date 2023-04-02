import { decodeMessage } from "@packages/shared/messages.ts";

import { Logger } from "../logger.ts";
import { DocumentsService } from "./service.ts";
import { LiveDocument } from "./live-document.ts";
import { Redis } from "../redis.ts";

type DocumentID = string;

export class DocumentsGateway {
  logger = new Logger("DocumentsGateway");

  liveDocuments = new Map<DocumentID, LiveDocument>();
  connections = new Map<DocumentID, Set<WebSocket>>();
  connectionData = new Map<WebSocket, LiveDocument>();

  constructor(
    private readonly redis: Redis,
    private readonly documentsService: DocumentsService
  ) {}

  async onConnect(
    client: WebSocket,
    documentID: string,
    email: string | null,
    actorID: string | null
  ) {
    if (!actorID || !documentID || !email) {
      client.close(4500);
      return;
    }
    if (!this.connections.get(documentID)) {
      this.connections.set(documentID, new Set());
    }

    const connections = this.connections.get(documentID)!;
    connections.add(client);

    let liveDocument = this.liveDocuments.get(documentID);
    if (!liveDocument) {
      const project = await this.documentsService.getProject(documentID);
      const document = await this.documentsService.getDocument(
        project.owner,
        documentID
      );

      liveDocument = new LiveDocument(this.redis, this.documentsService, {
        project,
        document,
        documentID,
      });
      this.liveDocuments.set(documentID, liveDocument);
    }

    liveDocument.addConnection(client, {
      actorID,
      email,
    });
    this.connectionData.set(client, liveDocument);

    client.onmessage = this.onMessage.bind(this, client);
    client.onclose = this.onDisconnect.bind(this, client);

    this.logger.log("Client connected", email, "-", documentID);
  }

  onDisconnect = async (client: WebSocket) => {
    const liveDocument = this.connectionData.get(client);
    if (liveDocument) {
      const data = liveDocument.getConnectionData(client);
      this.logger.log(
        "Client disconnected",
        data?.email,
        "-",
        liveDocument.documentID
      );

      await liveDocument.removeConnection(client);
      this.connectionData.delete(client);

      const documentConnections = this.connections.get(liveDocument.documentID);
      documentConnections?.delete(client);

      if (documentConnections?.size === 0) {
        this.liveDocuments.delete(liveDocument.documentID);
      }
    }
  };

  onMessage = (client: WebSocket, ev: MessageEvent) => {
    try {
      const decoded = decodeMessage(new Uint8Array(ev.data));
      switch (decoded.type) {
        case "update":
          this.handleUpdate(client, decoded.updates);
          break;
        case "connect":
          this.handleConnect(
            client,
            decoded.email,
            decoded.documentID,
            decoded.actorID
          );
          break;
      }
    } catch (err) {
      this.logger.error("Could not decode message", err);
    }
  };

  async handleConnect(
    client: WebSocket,
    email: string,
    documentID: string,
    actorID: string
  ) {
    // perform auth here?
    const liveDocument = this.liveDocuments.get(documentID);
    if (!liveDocument) {
      this.logger.error("No document data stored locally");
      return;
    }

    await liveDocument.handleConnect(client, email, actorID);
  }

  async handleUpdate(client: WebSocket, updates: number[]) {
    if (updates.length <= 0) {
      return;
    }

    this.logger.log("Recieved update from client");

    const liveDocument = this.connectionData.get(client);
    if (!liveDocument) {
      this.logger.error("No local document information");
      return;
    }

    await liveDocument.applyUpdates(client, updates);
  }
}

import { Automerge } from "../automerge.ts";
import { decodeMessage, encodeMessage } from "@packages/shared/messages.ts";

import { Logger } from "../logger.ts";
import { DocumentsService } from "./service.ts";

type DocumentID = string;

export class DocumentsGateway {
  logger = new Logger("DocumentsGateway");

  documents = new Map<DocumentID, Automerge.Doc<unknown>>();
  syncStates = new Map<Automerge.ActorId, Automerge.SyncState>();

  connections = new Map<DocumentID, Set<WebSocket>>();
  connectionData = new Map<
    WebSocket,
    { actorID: Automerge.ActorId; documentID: string }
  >();

  constructor(private readonly documentsService: DocumentsService) {}

  onConnect(client: WebSocket, documentID: string, actorID: string | null) {
    if (!actorID || !documentID) {
      client.close(4500);
      return;
    }
    if (!this.connections.get(documentID)) {
      this.connections.set(documentID, new Set());
    }

    const connections = this.connections.get(documentID)!;
    connections.add(client);

    this.connectionData.set(client, {
      actorID,
      documentID,
    });

    client.onmessage = this.onMessage.bind(this, client);
    client.onclose = this.onDisconnect.bind(this, client);
  }

  onDisconnect = (client: WebSocket) => {
    const data = this.connectionData.get(client);
    if (data) {
      const { documentID, actorID } = data;
      console.log("client disconnected", data.actorID);

      this.syncStates.delete(actorID);
      this.connectionData.delete(client);

      const connections = this.connections.get(documentID);
      if (connections) {
        connections.delete(client);

        if (connections.size === 0) {
          this.connections.delete(documentID);
          this.documents.delete(documentID);
        }
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
          this.handleConnect(client, decoded.documentID, decoded.actorID);
          break;
      }
    } catch (err) {
      this.logger.error("Could not decode message", err);
    }
  };

  async handleConnect(_client: WebSocket, documentID: string, actorID: string) {
    // perform auth here?
    const document = await this.documentsService.getDocument(documentID);

    const [newSyncState, updates] = Automerge.generateSyncMessage(
      document,
      Automerge.initSyncState()
    );

    if (updates) {
      try {
        const [newDoc, finalSyncState] = Automerge.receiveSyncMessage(
          document,
          newSyncState,
          updates
        );

        this.syncStates.set(actorID, finalSyncState);

        await this.documentsService.saveDocument(documentID, newDoc);
      } catch (err) {
        this.logger.error("Could not update document", err);
      }
    }
  }

  async handleUpdate(client: WebSocket, updates: number[]) {
    if (updates.length <= 0) {
      return;
    }

    this.logger.log("Recieved update from client");

    const connectionData = this.connectionData.get(client);
    if (!connectionData) {
      this.logger.error("No connection data");
      return;
    }

    // First sync the doc with the incoming changes from the client
    const { documentID } = connectionData;
    const document = await this.documentsService.getDocument(documentID);
    if (!document) {
      this.logger.error("Document not found");
    }

    try {
      const newDoc = Automerge.loadIncremental(
        document,
        new Uint8Array(updates)
      );

      await this.documentsService.saveDocument(documentID, newDoc);

      // Then we want to send the new document state to other clients
      const allConnections = this.connections.get(documentID);
      if (!allConnections) {
        return;
      }
      allConnections.forEach((connection) => {
        if (connection !== client) {
          const { documentID, actorID } =
            this.connectionData.get(connection) ?? {};
          if (!documentID || !actorID) {
            return;
          }

          const syncState =
            this.syncStates.get(actorID) ?? Automerge.initSyncState();
          const [newSyncState, clientSyncMessage] =
            Automerge.generateSyncMessage(newDoc, syncState);
          this.syncStates.set(actorID, newSyncState);
          if (!clientSyncMessage) {
            this.logger.log("No sync message to send");
            return;
          }

          const message = encodeMessage("sync", { data: clientSyncMessage });
          connection.send(message);
        }
      });
    } catch (error) {
      this.logger.error("Error updating document", error);
    }
  }
}

import { Cron } from "https://deno.land/x/croner@6.0.3/dist/croner.js";
import { Automerge } from "../automerge.ts";
import type { Redis } from "../redis.ts";
import type { Project } from "@packages/shared/api.ts";
import { encodeMessage } from "@packages/shared/messages.ts";
import { DocumentsService } from "./service.ts";
import { Logger } from "../logger.ts";

export class LiveDocument {
  logger = new Logger("LiveDocument");

  connectionData = new Map<
    WebSocket,
    { email: string; actorID: Automerge.ActorId }
  >();

  connections = new Set<WebSocket>();
  syncStates = new Map<Automerge.ActorId, Automerge.SyncState>();

  job: Cron;

  documentID: string;
  project: Project;
  document: Automerge.Doc<unknown>;

  constructor(
    readonly redis: Redis,
    readonly documentsService: DocumentsService,
    {
      project,
      document,
      documentID,
    }: {
      project: Project;
      document: Automerge.Doc<unknown>;
      documentID: string;
    }
  ) {
    this.project = project;
    this.document = document;
    this.documentID = documentID;

    // Every 3 minutes, save the document to the database
    this.job = new Cron("*/3 * * * *", this.saveDocument.bind(this));

    this.logger.log("Live document is ready");
  }

  addConnection(client: WebSocket, info: { email: string; actorID: string }) {
    this.connectionData.set(client, info);
    this.connections.add(client);
  }

  async removeConnection(client: WebSocket) {
    this.connections.delete(client);
    this.connectionData.delete(client);

    if (this.connections.size === 0) {
      await this.cleanup();
    }
  }

  getConnectionData(client: WebSocket) {
    return this.connectionData.get(client);
  }

  async cleanup() {
    this.logger.log("Cleaning up live document");

    await this.saveDocument();

    this.job.stop();
    this.connections.clear();
    this.connectionData.clear();
  }

  handleConnect(_client: WebSocket, _email: string, actorID: string) {
    try {
      const [newSyncState, updates] = Automerge.generateSyncMessage(
        this.document,
        Automerge.initSyncState()
      );

      if (updates) {
        try {
          const [newDoc, finalSyncState] = Automerge.receiveSyncMessage(
            this.document,
            newSyncState,
            updates
          );

          this.syncStates.set(actorID, finalSyncState);

          this.document = newDoc;
        } catch (err) {
          this.logger.error("Could not update document", err);
        }
      }
    } catch (err) {
      this.logger.error("Could not generate sync message", err);
    }
  }

  applyUpdates(sourceClient: WebSocket, updates: number[]) {
    // First sync the doc with the incoming changes from the client
    try {
      const newDoc = Automerge.loadIncremental(
        this.document,
        new Uint8Array(updates)
      );

      this.document = newDoc;

      if (!this.job.isBusy()) {
        this.job.trigger();
      }

      // Then we want to send the new document state to other clients
      const allConnections = Array.from(this.connections.values());
      if (!allConnections) {
        return;
      }
      allConnections.forEach((connection) => {
        if (connection !== sourceClient) {
          const connectionData = this.getConnectionData(connection);
          if (!connectionData) {
            return;
          }
          const { actorID } = connectionData;
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

  saveDocument = async () => {
    this.logger.log("Saving document");
    await this.documentsService.saveDocument(
      this.project.owner,
      this.documentID,
      this.document
    );
  };
}

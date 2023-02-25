import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { Server, WebSocket } from 'ws';
import * as Automerge from '@automerge/automerge';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';

type DocumentID = string;

@WebSocketGateway(3002, {
  path: '/documents',
  serveClient: false,
  transports: ['websocket'],
})
export class DocumentsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  private server: Server;

  documents = new Map<DocumentID, Automerge.Doc<unknown>>();
  syncStates = new Map<Automerge.ActorId, Automerge.SyncState>();

  connections = new Map<DocumentID, Set<WebSocket>>();
  connectionData = new Map<
    WebSocket,
    { actorID: Automerge.ActorId; documentID: string }
  >();

  constructor(@InjectRedis() private readonly redis: Redis) {}

  handleConnection(client: WebSocket, request: IncomingMessage) {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const actorID = url.searchParams.get('actorID');
    const documentID = url.searchParams.get('documentID');
    if (!actorID || !documentID) {
      client.close(4500);
    }
    if (!this.connections.get(documentID)) {
      this.connections.set(documentID, new Set());
    }

    const connections = this.connections.get(documentID);
    connections.add(client);

    this.connectionData.set(client, {
      actorID,
      documentID,
    });
  }

  handleDisconnect(client: WebSocket) {
    const data = this.connectionData.get(client);
    if (data) {
      const { documentID, actorID } = data;
      console.log('client disconnected', data.actorID);

      this.syncStates.delete(actorID);

      const connections = this.connections.get(documentID);
      if (connections) {
        connections.delete(client);
      }
    }
  }

  @SubscribeMessage('connect')
  async handleAuthentication(
    @MessageBody()
    {
      actorID,
      documentID,
      syncMessage,
    }: { actorID: string; documentID: string; syncMessage: number[] },
    @ConnectedSocket() client: WebSocket,
  ) {
    // perform auth here?

    const initialSyncState = Automerge.initSyncState();

    const document = await this.getDocument(actorID, documentID);

    // Get the clients sync information when they connect and apply to the
    // document
    if (syncMessage.length > 0) {
      const [newDoc, syncState] = Automerge.receiveSyncMessage(
        document,
        initialSyncState,
        Uint8Array.from(syncMessage),
      );
      this.documents.set(documentID, newDoc);

      await this.saveDocument(documentID, newDoc);

      // Generate a sync message for the client to consume and apply to their
      // local document
      const [newSyncState, clientSyncMessage] = Automerge.generateSyncMessage(
        newDoc,
        syncState,
      );
      this.syncStates.set(actorID, newSyncState);

      const message = this.encodedMessage('sync', clientSyncMessage);
      const buffer = Buffer.from(message);
      client.send(buffer);
    }
  }

  @SubscribeMessage('update')
  async handleUpdate(
    @MessageBody() data: { updates: number[] },
    @ConnectedSocket() client: WebSocket,
  ) {
    const connectionData = this.connectionData.get(client);
    if (!connectionData) {
      console.error('No connection data');
    }

    // First sync the doc with the incoming changes from the client
    const { documentID, actorID } = connectionData;
    const document = this.documents.get(documentID);
    const currentSyncState = this.syncStates.get(actorID);
    const [newDoc, clientSyncState] = Automerge.receiveSyncMessage(
      document,
      currentSyncState,
      Uint8Array.from(data.updates),
    );
    this.documents.set(documentID, newDoc);
    this.syncStates.set(actorID, clientSyncState);

    await this.saveDocument(documentID, newDoc);

    // Then we want to send the new document state to other clients
    const allConnections = this.connections.get(documentID);
    allConnections.forEach((connection) => {
      if (connection !== client) {
        const { documentID, actorID } = this.connectionData.get(connection);
        if (!documentID || !actorID) {
          return;
        }

        const syncState =
          this.syncStates.get(actorID) ?? Automerge.initSyncState();
        const [newSyncState, clientSyncMessage] = Automerge.generateSyncMessage(
          newDoc,
          syncState,
        );
        this.syncStates.set(actorID, newSyncState);
        if (!clientSyncMessage) {
          console.log('No sync message to send');
          return;
        }

        const message = this.encodedMessage('sync', clientSyncMessage);
        const buffer = Buffer.from(message);

        console.log('sending message to client', actorID);
        connection.send(buffer);
      }
    });
  }

  // silly encoding method to store info in an array buffer
  private encodedMessage(event: string, data: Uint8Array) {
    const encoder = new TextEncoder();
    const encodedEvent = encoder.encode(event);
    return [...encodedEvent, 0, ...data];
  }

  // going to fake reading the document
  // ideally it can store permanent in redis or sql or something
  private async getDocument(actorID: string, documentID: string) {
    if (this.documents.has(documentID)) {
      return this.documents.get(documentID);
    }

    let document: Automerge.Doc<unknown>;
    const documentData = await this.redis.getBuffer(documentID);
    if (documentData) {
      const data = Uint8Array.from(documentData);
      document = Automerge.load(data);
    } else {
      document = Automerge.from({
        id: documentID,
        todos: [],
      });
    }

    return document;
  }

  private async saveDocument(
    documentID: string,
    document: Automerge.Doc<unknown>,
  ) {
    await this.redis.set(documentID, Buffer.from(Automerge.save(document)));
  }
}

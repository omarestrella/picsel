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
import { Server, WebSocket, MessageEvent } from 'ws';
import * as Automerge from '@automerge/automerge';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { Logger } from '@nestjs/common';
import { decodeMessage } from '@packages/shared/messages';

import { DocumentsService } from './documents.service';

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

  logger = new Logger('DocumentsGateway');

  documents = new Map<DocumentID, Automerge.Doc<unknown>>();
  syncStates = new Map<Automerge.ActorId, Automerge.SyncState>();

  connections = new Map<DocumentID, Set<WebSocket>>();
  connectionData = new Map<
    WebSocket,
    { actorID: Automerge.ActorId; documentID: string }
  >();

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly documentsService: DocumentsService,
  ) {}

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

    client.addEventListener('message', this.onMessage);
  }

  handleDisconnect(client: WebSocket) {
    client.removeEventListener('message', this.onMessage);

    const data = this.connectionData.get(client);
    if (data) {
      const { documentID, actorID } = data;
      console.log('client disconnected', data.actorID);

      this.syncStates.delete(actorID);
      this.connectionData.delete(client);

      const connections = this.connections.get(documentID);
      if (connections) {
        connections.delete(client);
      }

      if (connections.size === 0) {
        this.connections.delete(documentID);
        this.documents.delete(documentID);
      }
    }
  }

  onMessage = (ev: MessageEvent) => {
    const decoded = decodeMessage(ev.data as Buffer);
    console.log(decoded);
  };

  async handleConnect(documentID: string, actorID: string) {
    // perform auth here?

    console.log('got this', actorID);

    const document = await this.documentsService.getDocument(documentID);

    const [newSyncState, updates] = Automerge.generateSyncMessage(
      document,
      Automerge.initSyncState(),
    );
    const [newDoc, finalSyncState] = Automerge.receiveSyncMessage(
      document,
      newSyncState,
      updates,
    );

    this.syncStates.set(actorID, finalSyncState);

    await this.documentsService.saveDocument(documentID, newDoc);
  }

  @SubscribeMessage('update')
  async handleUpdate(
    @MessageBody() data: { updates: number[] },
    @ConnectedSocket() client: WebSocket,
  ) {
    if (data.updates.length <= 0) {
      return;
    }

    this.logger.debug('Recieved update from client');

    const connectionData = this.connectionData.get(client);
    if (!connectionData) {
      this.logger.error('No connection data');
      return;
    }

    // First sync the doc with the incoming changes from the client
    const { documentID } = connectionData;
    const document = await this.documentsService.getDocument(documentID);
    if (!document) {
      this.logger.error('Document not found');
    }

    const newDoc = Automerge.loadIncremental(
      document,
      new Uint8Array(data.updates),
    );

    await this.documentsService.saveDocument(documentID, newDoc);

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
          this.logger.log('No sync message to send');
          return;
        }

        const message = this.encodedMessage('sync', clientSyncMessage);
        const buffer = Buffer.from(message);
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
}

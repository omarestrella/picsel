import { EventEmitter } from '@packages/event-emitter';
import {
	decodeMessage,
	encodeMessage,
	type MessageData,
	type Messages,
	type MessageType
} from '@packages/shared/messages';
import { PUBLIC_WEBSOCKET_SERVER } from '$env/static/public';

export class WebSocketTransport extends EventEmitter<Messages> {
	private reconnect = true;

	private ws: WebSocket | undefined;

	connect(email: string, documentID: string, actorID: string) {
		if (typeof WebSocket === 'undefined') {
			return;
		}

		// const url = new URL(`ws://localhost:4000/documents/${documentID}/sync`);
		const url = new URL(`${PUBLIC_WEBSOCKET_SERVER}/${documentID}/sync`);
		url.searchParams.append('actorID', actorID);
		url.searchParams.append('email', email);

		this.ws = new WebSocket(url.toString());
		this.ws.binaryType = 'arraybuffer';
		this.ws.addEventListener('message', this.onMessage);
		this.ws.addEventListener('open', () => {
			if (this.ws?.readyState === this.ws?.OPEN) {
				console.log('Actor connecting -', actorID);
				this.send('connect', { email, documentID, actorID });
			}
		});
		this.ws.addEventListener('close', () => {
			if (!this.reconnect) return;

			setTimeout(() => this.connect(email, documentID, actorID), 2000);
		});
	}

	disconnect() {
		this.reconnect = false;
		this.ws?.close();
	}

	sendUpdates(updates: Uint8Array) {
		this.send('update', { updates: Array.from(updates) });
	}

	send<T extends MessageType>(type: T, data: MessageData<T>) {
		this.ws?.send(encodeMessage(type, data));
	}

	onMessage = (ev: MessageEvent) => {
		try {
			const arr = new Uint8Array(ev.data);
			const message = decodeMessage(arr);

			if (message.type === 'sync') {
				this.emit('sync', message.data);
			}
		} catch (err) {
			console.error('Could not parse server event', err);
		}
	};

	private decodeEvent(data: Uint8Array) {
		let separatorIdx = data.indexOf(0);
		let decoder = new TextDecoder();
		const event = decoder.decode(data.subarray(0, separatorIdx));
		return {
			event,
			update: data.subarray(separatorIdx + 1)
		};
	}
}

import { EventEmitter } from '@packages/event-emitter';
import {
	encodeMessage,
	type MessageData,
	type Messages,
	type MessageType
} from '@packages/shared/messages';

export class WebSocketTransport extends EventEmitter<Messages> {
	private connected = false;

	private ws: WebSocket | undefined;

	connect(documentID: string, actorID: string) {
		if (typeof WebSocket === 'undefined') {
			return;
		}

		const url = new URL(`ws://localhost:3000/documents/${documentID}/sync`);
		url.searchParams.append('actorID', actorID);

		this.ws = new WebSocket(url.toString());
		this.ws.binaryType = 'arraybuffer';
		this.ws.addEventListener('message', this.onMessage);
		this.ws.addEventListener('open', () => {
			if (this.ws?.readyState === this.ws?.OPEN) {
				console.log('Actor connecting -', actorID);
				this.send('connect', { documentID, actorID });
			}
		});
		this.ws.addEventListener('close', () => {
			setTimeout(() => this.connect(documentID, actorID), 2000);
		});
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
			const { event, update } = this.decodeEvent(arr);

			if (event) {
				this.emit(event as keyof Messages, update);
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

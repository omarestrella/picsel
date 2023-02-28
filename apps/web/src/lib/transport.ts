import { EventEmitter } from '@packages/event-emitter';
import { encodeMessage, type Messages } from '@packages/shared/messages';

type WebSocketEvents = {
	update: { updates: number[] };
	connect: { documentID: string; actorID: string; syncMessage: number[] };
};

export class WebSocketTransport extends EventEmitter<Messages> {
	private connected = false;

	private ws: WebSocket | undefined;

	connect(documentID: string, actorID: string, syncMessage: Uint8Array | null) {
		if (typeof WebSocket === 'undefined') {
			return;
		}

		const url = new URL('ws://localhost:3002/documents');
		url.searchParams.append('actorID', actorID);
		url.searchParams.append('documentID', documentID);

		this.ws = new WebSocket(url.toString());
		this.ws.binaryType = 'arraybuffer';
		this.ws.addEventListener('message', this.onMessage);
		this.ws.addEventListener('open', () => {
			if (this.ws?.readyState === this.ws?.OPEN) {
				console.log('Actor connecting -', actorID);
				this.send('connect', documentID, actorID);
			}
		});
		this.ws.addEventListener('close', () => {
			setTimeout(() => this.connect(documentID, actorID, null), 500);
		});
	}

	sendUpdates(updates: Uint8Array) {
		this.send('update', Array.from(updates));
	}

	send<E extends keyof Messages>(event: E, ...args: Parameters<Messages[E]>) {
		this.ws?.send(encodeMessage(event, ...args));
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

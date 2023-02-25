import { EventEmitter } from 'event-emitter';
import { Automerge, type BaseDoc } from './automerge';

type WebSocketEvents = {
	update: { updates: number[] };
	connect: { documentID: string; actorID: string; syncMessage: number[] };
};

type Events = {
	sync(data: Uint8Array): void;
	connected(data: Uint8Array): void;
};

export class WebSocketTransport extends EventEmitter<Events> {
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
				this.send('connect', {
					documentID: documentID,
					actorID: actorID,
					syncMessage: Array.from(syncMessage ?? []) as number[]
				});
			}
		});
		this.ws.addEventListener('close', () => {
			setTimeout(() => this.connect(documentID, actorID, null), 500);
		});
	}

	sendUpdates(updates: Uint8Array) {
		this.send('update', { updates: Array.from(updates) });
	}

	send<E extends keyof WebSocketEvents>(event: E, data: WebSocketEvents[E]) {
		this.ws?.send(
			JSON.stringify({
				event,
				data
			})
		);
	}

	onMessage = (ev: MessageEvent) => {
		try {
			const arr = new Uint8Array(ev.data);
			const { event, update } = this.decodeEvent(arr);

			if (event) {
				this.emit(event as keyof Events, update);
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

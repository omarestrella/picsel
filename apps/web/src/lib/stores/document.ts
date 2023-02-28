import type { Project } from '@packages/shared/types';
import { writable } from 'svelte/store';
import { Automerge } from '../automerge';
import { WebSocketTransport } from '../transport';
import { activeLayer } from './layer';

export function createDocument(options: { docID: string; data?: Uint8Array }) {
	const doc = options.data ? Automerge.load<Project>(options.data) : Automerge.init<Project>();

	activeLayer.set(doc.layers?.[0]);

	let syncState = Automerge.initSyncState();

	const { update, subscribe } = writable(doc);

	let ws = new WebSocketTransport();

	const documentStore = {
		subscribe,
		change(changeFn: Automerge.ChangeFn<Project>) {
			update((currentDoc) => {
				const newDoc = Automerge.change(currentDoc, changeFn);
				const updates = Automerge.getLastLocalChange(newDoc);
				if (updates) {
					ws?.sendUpdates(updates);
				}
				syncState = newSyncState;
				return newDoc;
			});
		}
	};

	ws.on('sync', (data) => {
		console.log('Sync from server', data);

		update((doc) => {
			const [newDoc, newSyncState] = Automerge.receiveSyncMessage(doc, syncState, data);
			syncState = newSyncState;
			return newDoc;
		});
	});

	const [newSyncState, syncMessage] = Automerge.generateSyncMessage(doc, syncState);
	syncState = newSyncState;
	ws.connect(options.docID, Automerge.getActorId(doc), null);

	return documentStore;
}

export type DocumentStore = ReturnType<typeof createDocument>;

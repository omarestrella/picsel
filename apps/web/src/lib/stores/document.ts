import type { Project } from '@packages/shared/types';
import { writable } from 'svelte/store';
import { Automerge } from '../automerge';
import { WebSocketTransport } from '../transport';
import { activeLayer } from './layer';

export function createDocument(options: { owner: string; documentID: string; data?: Uint8Array }) {
	const doc = options.data ? Automerge.load<Project>(options.data) : Automerge.init<Project>();

	activeLayer.set(doc.layers?.[0]);

	let syncState = Automerge.initSyncState();

	const { update, subscribe } = writable(doc);

	let ws = new WebSocketTransport();

	const documentStore = {
		subscribe,
		change(changeFn: Automerge.ChangeFn<Project>, options?: Automerge.ChangeOptions<Project>) {
			update((currentDoc) => {
				const newDoc = options
					? Automerge.change(currentDoc, options, changeFn)
					: Automerge.change(currentDoc, changeFn);
				const updates = Automerge.getLastLocalChange(newDoc);
				if (updates) {
					ws?.sendUpdates(updates);
				}
				syncState = newSyncState;
				return newDoc;
			});
		},
		undo() {
			console.log('No undo yet :(');
		},
		disconnect() {
			ws?.disconnect();
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
	ws.connect(options.owner, options.documentID, Automerge.getActorId(doc));

	return documentStore;
}

export type DocumentStore = ReturnType<typeof createDocument>;

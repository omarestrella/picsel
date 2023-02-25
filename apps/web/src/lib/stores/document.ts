import { writable } from 'svelte/store';
import { Automerge, type BaseDoc } from '../automerge';
import { WebSocketTransport } from '../transport';

export function createDocumentStore<T extends BaseDoc>(options: {
	actorID?: string;
	docID: string;
}) {
	const doc = Automerge.init<T>({
		actor: options.actorID
	});

	let syncState = Automerge.initSyncState();

	const { update, subscribe } = writable(doc);

	let ws = new WebSocketTransport();

	const documentStore = {
		subscribe,
		change(changeFn: Automerge.ChangeFn<T>) {
			update((currentDoc) => {
				const newDoc = Automerge.change(currentDoc, changeFn);
				const [newSyncState, syncMessage] = Automerge.generateSyncMessage(newDoc, syncState);
				if (syncMessage) {
					ws?.sendUpdates(syncMessage);
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
	ws.connect(options.docID, Automerge.getActorId(doc), syncMessage);

	return documentStore;
}

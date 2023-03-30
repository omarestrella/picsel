import type { Layer } from '@packages/shared/types';
import { writable } from 'svelte/store';
import type { DocumentStore } from './document';

function createStore() {
	const store = writable<Layer | undefined>();

	let documentStore: DocumentStore | undefined;

	let activeLayer: Layer | undefined;

	return {
		...store,
		setDocumentStore(docStore: DocumentStore) {
			documentStore = docStore;
			documentStore.subscribe((doc) => {
				store.update((currentLayer) => {
					return doc.layers?.find((layer) => layer.id === currentLayer?.id);
				});
			});
		}
	};
}

export const activeLayer = createStore();

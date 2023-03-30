<script lang="ts">
	import type { PageData } from './$types';
	import Editor from '$lib/components/Editor.svelte';
	import { createDocument } from '$lib/stores/document';
	import { setContext } from 'svelte';
	import { activeLayer } from '$lib/stores/layer';

	export let data: PageData;

	const documentData = new Uint8Array(data.document);

	let document = createDocument({
		owner: data.project.owner,
		documentID: data.project.document_id,
		data: documentData
	});

	// Not sure how I'm going to bind the layer system without this...
	// Should the relationship be inverted?
	activeLayer.setDocumentStore(document);

	setContext('documentStore', document);
	setContext('document', $document);
</script>

<div id="chrome">
	<Editor />
</div>

<style>
	#chrome {
		height: 100dvh;
		width: 100dvw;
	}
</style>

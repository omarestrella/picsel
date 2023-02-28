<script lang="ts">
	import type { DocumentStore } from '$lib/stores/document';
	import { v4 as uuid } from 'uuid';
	import type { Project } from 'shared';
	import { getContext } from 'svelte';

	const documentStore: DocumentStore<Project> = getContext('documentStore');

	function addLayer() {
		documentStore.change((doc) => {
			doc.layers.push({
				id: uuid(),
				name: `Layer ${doc.layers.length + 1}`,
				cells: [] as never
			});
		});
	}
</script>

<div class="toolbar">
	<button on:click={addLayer}> Add Layer </button>
</div>

<style>
	.toolbar {
		display: flex;
		height: 100%;
		width: 100%;
		padding: 8px;

		border-bottom: 1px solid black;
	}
</style>

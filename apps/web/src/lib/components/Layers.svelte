<script lang="ts">
	import type { DocumentStore } from '$lib/stores/document';
	import { activeLayer } from '$lib/stores/layer';
	import type { Layer } from '@packages/shared/types';
	import { getContext } from 'svelte';

	const documentStore: DocumentStore = getContext('documentStore');

	function deleteLayer(layer: Layer) {
		documentStore.change((doc) => {
			const idx = doc.layers.findIndex((l) => l.id === layer.id);
			doc.layers.deleteAt(idx);
		});
	}
</script>

<div class="layers">
	{#if $documentStore.layers}
		{#each $documentStore.layers as layer}
			<div
				class="layer"
				class:active={$activeLayer?.id === layer.id}
				on:click={() => activeLayer.set(layer)}
				on:keydown={() => activeLayer.set(layer)}
			>
				Layer: {layer.name}

				<button on:click={() => deleteLayer(layer)}>delete</button>
			</div>
		{/each}
	{/if}
</div>

<style lang="postcss">
	.layers {
		display: flex;
		gap: 4px;
		height: 100%;
		width: 100%;
		flex-direction: column;
		border-right: 1px solid black;
		padding: 4px;
	}

	.layer {
		display: grid;
		height: 96px;
		padding: 4px;
		border: 1px solid black;

		&:hover {
			cursor: pointer;
		}
	}
</style>

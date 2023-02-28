<script lang="ts">
	import type { DocumentStore } from '$lib/stores/document';
	import type { Layer } from '@packages/shared/types';
	import { getContext } from 'svelte';
	import { v4 } from 'uuid';

	export let layer: Layer;
	export let x: number;
	export let y: number;

	const documentStore: DocumentStore = getContext('documentStore');

	$: cell = layer.cells.find((c) => c.x === x && c.y === y);

	function fillCell() {
		documentStore.change((doc) => {
			const docLayer = doc.layers.find((l) => l.id === layer?.id);
			if (!docLayer) {
				return;
			}
			const pixel = docLayer.cells.find((p) => p.x === x && p.y === y);

			if (pixel) {
				pixel.color = 'black';
			} else {
				docLayer.cells.push({
					id: v4(),
					color: 'black',
					x,
					y
				});
			}
		});
	}
</script>

<button
	class="cell"
	style="
    --bg-color: {cell?.color ?? 'transparent'}
  "
	on:click={fillCell}
/>

<style lang="postcss">
	.cell {
		width: 16px;
		height: 16px;

		background-color: var(--bg-color);

		border: none;
		border-right: 1px solid grey;

		&:last-of-type {
			border-right: 0;
		}
	}
</style>

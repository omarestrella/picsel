<script lang="ts">
	import type { DocumentStore } from '$lib/stores/document';
	import { tools } from '$lib/stores/tools';
	import type { List } from '@automerge/automerge';
	import type { Cell, Layer } from '@packages/shared/types';
	import { getContext } from 'svelte';
	import { v4 } from 'uuid';
	import Layers from '../Layers.svelte';

	export let layer: Layer;
	export let x: number;
	export let y: number;
	export let modifyOnHover = false;

	const documentStore: DocumentStore = getContext('documentStore');

	$: cell = layer.cells.find((c) => c.x === x && c.y === y);

	function performErase(cells: List<Cell>) {
		const idx = cells.findIndex((p) => p.x === x && p.y === y);
		if (idx >= 0) {
			cells.deleteAt(idx);
		}
	}

	function performPencil(cells: List<Cell>) {
		const cell = cells.find((p) => p.x === x && p.y === y);
		if (cell) {
			cell.color = $tools.color;
		} else {
			cells.push({
				id: v4(),
				color: $tools.color,
				x,
				y
			});
		}
	}

	function performFill(cells: List<Cell>) {
		const { width, height } = $documentStore.size;
		function fill(row: number, col: number) {
			if (row < 0 || row >= height || col < 0 || col >= width) {
				return;
			}

			const cell = cells.find((c) => c.x === col && c.y === row);

			if (cell) {
				return;
			}

			cells.push({
				id: v4(),
				color: $tools.color,
				x: col,
				y: row
			});

			fill(row, col + 1);
			fill(row, col - 1);
			fill(row + 1, col);
			fill(row - 1, col);
		}

		fill(y, x);
	}

	function changeCell() {
		documentStore.change(
			(doc) => {
				const docLayer = doc.layers.find((l) => l.id === layer?.id);
				if (!docLayer) {
					return;
				}

				if ($tools.tool === 'eraser') {
					performErase(docLayer.cells);
				} else if ($tools.tool === 'pencil') {
					performPencil(docLayer.cells);
				} else if ($tools.tool === 'fill') {
					performFill(docLayer.cells);
				}
			},
			{ message: 'changed cell' }
		);
	}
</script>

<button
	class="cell"
	style="
    --bg-color: {cell?.color ?? 'transparent'}
  "
	on:click={changeCell}
	on:pointerenter={() => {
		if (modifyOnHover) {
			changeCell();
		}
	}}
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

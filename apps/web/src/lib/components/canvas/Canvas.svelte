<script lang="ts">
	import type { DocumentStore } from '$lib/stores/document';
	import { activeLayer } from '$lib/stores/layer';
	import type { Layer, ProjectSize } from '@packages/shared/types';

	import { getContext } from 'svelte';
	import Cell from './Cell.svelte';

	const documentStore: DocumentStore = getContext('documentStore');

	let size: ProjectSize;

	$: {
		size = $documentStore.size;
	}
</script>

{#if $activeLayer}
	<div
		class="active-layer"
		style="
		--width: {size.width * 16}px;
		--height: {size.height * 16}px;
	"
	>
		{#each new Array(size.width).fill(0) as _, y}
			<div class="row">
				{#each new Array(size.height).fill(0) as _, x}
					<Cell {x} {y} layer={$activeLayer} />
				{/each}
			</div>
		{/each}
	</div>
{/if}

<style lang="postcss">
	.active-layer {
		margin: 24px;

		width: var(--width);
		height: var(--height);
	}

	.row {
		display: flex;
		border: 1px solid grey;
		border-bottom: 0;

		&:last-of-type {
			border-bottom: 1px solid grey;
		}
	}
</style>

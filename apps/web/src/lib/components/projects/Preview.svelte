<script lang="ts">
	import type { Layer, Cell } from '@packages/shared/types';

	export let loading = false;

	export let layer: Layer | null = null;
	export let rows: number | null = null;
	export let columns: number | null = null;

	let cells: Record<string, Cell> = {};
	$: {
		cells =
			layer?.cells.reduce((obj, cell) => {
				let key = `${cell.x}-${cell.y}`;
				obj[key] = cell;
				return obj;
			}, {} as Record<string, Cell>) || {};
	}
</script>

<span class="flex w-full h-full justify-center items-center overflow-hidden">
	{#if loading}
		<span class="text-xs text-gray-500">Loading...</span>
	{:else if layer?.cells && rows && columns}
		<div class="preview-container flex flex-col justify-center items-center">
			{#each new Array(rows) as _, y}
				<div class="row flex w-full">
					{#each new Array(columns).fill(0) as _, x}
						{@const cell = cells[`${x}-${y}`]}
						<div class="w-3 h-3 bg-[--color]" style="--color: {cell?.color}" />
					{/each}
				</div>
			{/each}
		</div>
	{:else}
		<span class="text-xs text-gray-500">Cannot generate preview</span>
	{/if}
</span>

<script lang="ts">
	import { page } from '$app/stores';
	import type { DocumentStore } from '$lib/stores/document';
	import { tools } from '$lib/stores/tools';
	import { v4 as uuid } from 'uuid';
	import { getContext } from 'svelte';
	import Icon from '$lib/icons/Icon.svelte';

	const documentStore: DocumentStore = getContext('documentStore');

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
	<div class="group">
		<button on:click={addLayer}> Add Layer </button>
	</div>
	<div class="group">
		<button on:click={() => tools.setColor('red')}>
			Red {$tools.color === 'red' ? '*' : ''}
		</button>
		<button on:click={() => tools.setColor('black')}>
			Black {$tools.color === 'black' ? '*' : ''}
		</button>
		<button on:click={() => tools.setColor('blue')}>
			Blue {$tools.color === 'blue' ? '*' : ''}
		</button>
	</div>
	<div class="group">
		<button on:click={() => tools.setTool('pencil')}>
			<Icon kind="pencil" size="18px" />
			{$tools.tool === 'pencil' ? '*' : ''}
		</button>
		<button on:click={() => tools.setTool('fill')}>
			<Icon kind="bucket" size="18px" />
			{$tools.tool === 'fill' ? '*' : ''}
		</button>
		<button on:click={() => tools.setTool('eraser')}>
			<Icon kind="eraser" size="18px" />
			{$tools.tool === 'eraser' ? '*' : ''}
		</button>
	</div>
	<div class="group">
		{$page.data.session?.user?.email}
	</div>
</div>

<style lang="postcss">
	.toolbar {
		display: flex;
		gap: 12px;
		height: 100%;
		width: 100%;
		padding: 8px;

		border-bottom: 1px solid black;
	}

	.group {
		display: flex;
		gap: 4px;
	}

	button {
		display: inline-flex;

		width: auto;
		height: auto;
		padding: 0;
		margin: 0;

		border: 1px solid black;
		background-color: transparent;

		&:hover {
			cursor: pointer;
		}
	}
</style>

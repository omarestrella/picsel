<script lang="ts">
	import type { DocumentStore } from '$lib/stores/document';
	import { tools } from '$lib/stores/tools';
	import { v4 as uuid } from 'uuid';
	import { getContext } from 'svelte';

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
			Pencil {$tools.tool === 'pencil' ? '*' : ''}
		</button>
		<button on:click={() => tools.setTool('fill')}>
			Fill {$tools.tool === 'fill' ? '*' : ''}
		</button>
		<button on:click={() => tools.setTool('eraser')}>
			Eraser {$tools.tool === 'eraser' ? '*' : ''}
		</button>
	</div>
</div>

<style>
	.toolbar {
		display: flex;
		gap: 12px;
		height: 100%;
		width: 100%;
		padding: 8px;

		border-bottom: 1px solid black;
	}
</style>

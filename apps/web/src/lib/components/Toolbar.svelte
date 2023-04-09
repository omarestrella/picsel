<script lang="ts">
	import type { DocumentStore } from '$lib/stores/document';
	import { tools } from '$lib/stores/tools';
	import { v4 as uuid } from 'uuid';
	import { getContext } from 'svelte';
	import ToolbarButton from './system/buttons/ToolbarButton.svelte';

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

<div
	class="
		toolbar
		grid grid-cols-1 grid-rows-[repeat(auto-fill,_minmax(48px,_48px))] items-center
		border-r border-neutral-200
	"
>
	<ToolbarButton
		active={$tools.tool === 'pencil'}
		icon="pencil"
		onClick={() => tools.setTool('pencil')}
	/>
	<ToolbarButton
		active={$tools.tool === 'fill'}
		icon="bucket"
		onClick={() => tools.setTool('fill')}
	/>
	<ToolbarButton
		active={$tools.tool === 'eraser'}
		icon="eraser"
		onClick={() => tools.setTool('eraser')}
	/>
</div>

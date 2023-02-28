<script lang="ts">
	import type { DocumentStore } from '$lib/stores/document';
	import { getContext } from 'svelte';
	import type { Project } from 'shared';
	import Canvas from './canvas/Canvas.svelte';
	import Layers from './Layers.svelte';
	import Toolbar from './Toolbar.svelte';

	let document = getContext('documentStore') as DocumentStore<Project>;
</script>

{#if $document.id}
	<div class="editor">
		<Toolbar />

		<div class="panels">
			<Layers />
			<Canvas />
		</div>
	</div>
{/if}

<style>
	.editor {
		display: grid;
		grid-template-rows: 48px minmax(0, 1fr);
		height: 100%;
		width: 100%;
	}

	.panels {
		display: grid;
		grid-template-columns: 128px minmax(0, 1fr);
		height: 100%;
		width: 100%;
	}
</style>

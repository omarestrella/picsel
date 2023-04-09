<script lang="ts">
	import type { DocumentStore } from '$lib/stores/document';
	import { getContext } from 'svelte';
	import Canvas from './canvas/Canvas.svelte';
	import Layers from './Layers.svelte';
	import Toolbar from './Toolbar.svelte';
	import Header from './Header.svelte';

	let document = getContext<DocumentStore>('documentStore');
</script>

<svelte:window
	on:keypress={(event) => {
		if (event.metaKey && event.key === 'z') {
			event.preventDefault();
			document.undo();
		}
	}}
/>

{#if $document.id}
	<div class="editor">
		<Header />

		<div class="panels w-full h-full grid grid-rows-1 grid-cols-[48px_minmax(0,_1fr)_128px]">
			<Toolbar />

			<Canvas />

			<!-- <Layers /> -->
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
</style>

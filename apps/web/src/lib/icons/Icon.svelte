<script lang="ts">
	import Bucket from './Bucket.svelte';
	import Eraser from './Eraser.svelte';
	import Pencil from './Pencil.svelte';

	export let kind: 'pencil' | 'eraser' | 'bucket';
	export let size: `${number}px` | undefined = undefined;

	let component: ConstructorOfATypedSvelteComponent;
	switch (kind) {
		case 'eraser':
			component = Eraser;
			break;
		case 'pencil':
			component = Pencil;
			break;
		case 'bucket':
			component = Bucket;
			break;
	}
</script>

<span class="icon-container" style:--size={size}>
	<svelte:component this={component} />
</span>

<style>
	.icon-container {
		width: var(--size);
		height: var(--size);
	}

	.icon-container :global(svg) {
		width: var(--size);
		height: var(--size);
	}
</style>

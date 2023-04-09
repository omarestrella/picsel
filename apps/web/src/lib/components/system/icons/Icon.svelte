<script lang="ts">
	import Bucket from './Bucket.svelte';
	import Eraser from './Eraser.svelte';
	import Pencil from './Pencil.svelte';
	import User from './User.svelte';
	import type { IconType } from './types';

	export let kind: IconType;
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
		case 'user':
			component = User;
			break;
	}
</script>

<span class="icon-container inline-block w-[--size] h-[--size]" style:--size={size}>
	<svelte:component this={component} />
</span>

<style>
	.icon-container :global(svg) {
		width: var(--size);
		height: var(--size);
	}
</style>

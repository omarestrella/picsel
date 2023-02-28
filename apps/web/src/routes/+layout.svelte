<script lang="ts">
	import '../app.postcss';
	import type { LayoutData } from './$types';

	export let data: LayoutData;
</script>

<slot />

<style>
	:global(html, body) {
		padding: 0;
		margin: 0;
	}

	:global(div) {
		box-sizing: border-box;
	}
</style>

<script lang="ts">
	import '../app.postcss';
</script>

<svelte:head>
	<title>Picsel</title>
</svelte:head>

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

<script lang="ts">
	import '../app.postcss';
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

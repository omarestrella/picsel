<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';
</script>

<div class="page">
	<div class="container">
		<button on:click={() => signIn('github')}> Sign in with Github </button>
	</div>
</div>

<style lang="postcss">
	.page {
		display: flex;
		align-items: center;
		justify-content: center;

		width: 100dvw;
		height: 100dvh;
	}

	.container {
		width: 200px;
		height: 300px;

		border: 1px solid black;
	}
</style>

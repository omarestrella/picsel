<script lang="ts">
	import { page } from '$app/stores';
	import { signOut } from '@auth/sveltekit/client';
</script>

{#if $page.data.session?.user}
	<div>
		{$page.data.session.user.email}<br />
		<button on:click={() => signOut()}>Sign out</button>
	</div>
	<div>
		<button on:click={() => void undefined}>Create Project</button>
	</div>
{:else}
	<a href="/auth">Sign in</a>
{/if}

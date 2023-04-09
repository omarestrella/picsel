<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';
	import { page } from '$app/stores';
	import Logo from './system/Logo.svelte';
</script>

<div
	class="
  header px-2
  flex items-center gap-4
  border-b border-neutral-200
"
>
	<div class="logo-container flex items-center justify-center h-8 w-8">
		<Logo width={28} height={28} />
	</div>

	<div class="header-content flex flex-1 justify-between">
		<div class="navigation text-xs">
			<a href="/" class="text-neutral-800 hover:text-neutral-600">Home</a>
		</div>

		<div class="user text-xs">
			{$page.data.session?.user?.email} |
			<a href="#top" class="text-neutral-800 hover:text-neutral-600" on:click={() => signOut()}
				>Logout</a
			>
		</div>
	</div>
</div>

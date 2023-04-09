<script lang="ts">
	import Icon from '../icons/Icon.svelte';
	import type { IconType } from '../icons/types';

	export let icon: IconType;
	export let active: boolean;

	export let onClick: () => void;
</script>

<button class="w-full h-full p-1 group" on:click={onClick}>
	<span
		class="
    w-full h-full
    flex items-center justify-center
    rounded-md
    {active ? 'bg-slate-300' : 'group-hover:bg-slate-200'}
  "
	>
		<Icon kind={icon} size="18px" />
	</span>
</button>

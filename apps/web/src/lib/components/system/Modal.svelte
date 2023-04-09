<script lang="ts">
	import { fade, fly } from 'svelte/transition';

	export let onClose: () => void;
</script>

<svelte:window
	on:keydown={({ key }) => {
		if (key === 'Escape') {
			onClose();
		}
	}}
/>

<div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
	<div
		class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
		in:fade={{
			duration: 150
		}}
		out:fade={{
			delay: 50,
			duration: 100
		}}
	/>

	<div
		class="fixed inset-0 z-10 overflow-y-auto"
		in:fade={{
			delay: 100,
			duration: 150
		}}
		out:fade={{
			duration: 100
		}}
	>
		<div class="flex min-h-full items-center justify-center p-4 text-center">
			<div
				class="relative transform w-3/4 max-w-xl overflow-hidden rounded-lg bg-white text-left shadow-xl"
			>
				<div class="w-full flex items-start py-5 px-4">
					<div class="w-full ml-4 mt-0">
						<h3 class="text-base text-left font-semibold leading-6 text-gray-900" id="modal-title">
							<slot name="title" />
						</h3>

						<div class="mt-2">
							<slot name="content" />
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

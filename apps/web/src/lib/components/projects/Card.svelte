<script lang="ts">
	import type { Project } from '@packages/shared/types';
	import Preview from './Preview.svelte';

	export let project: Project;
</script>

<div class="relative">
	<a
		href="/project/{project.id}"
		class="
      w-64 max-w-64 h-64 max-h-64
      grid grid-flow-row grid-rows-[minmax(0,_1fr),_max-content]
      ring-1 ring-slate-100 hover:ring-slate-200 group
    "
	>
		<span class="flex items-center justify-center">
			<Preview
				rows={project?.size.height}
				columns={project?.size.width}
				layer={project?.layers[0]}
			/>
		</span>
		<span class="flex items-center h-12 min-h-12 p-2 text-sm bg-slate-50 group-hover:bg-slate-100"
			>{project.name}</span
		>
	</a>

	<button class="absolute right-1 top-1" name="projectID" value={project.id} type="submit">
		delete
	</button>
</div>

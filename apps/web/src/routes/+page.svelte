<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import Header from '$lib/components/Header.svelte';
	import Modal from '$lib/components/system/Modal.svelte';
	import type { ActionData, PageData } from './$types';
	import Card from '$lib/components/projects/Card.svelte';

	export let form: ActionData;
	export let data: PageData;

	let createProject = false;

	function closeCreateModal() {
		createProject = false;
	}
</script>

{#if $page.data.session?.user}
	<div class="w-full h-full grid grid-cols-1 grid-rows-[48px_minmax(0,_1fr)]">
		<Header />

		<div class="content flex flex-col p-3">
			<div class="heading flex items-center justify-between mb-3">
				<h1 class="text-3xl font-semibold">Projects</h1>

				<button
					class="
						py-2 px-3	rounded-md
						text-white text-sm font-medium
						bg-blue-600 hover:bg-blue-500
						shadow-sm
						ring-1 ring-blue-600
						"
					on:click={() => {
						createProject = true;
					}}
				>
					Create Project
				</button>
			</div>

			<div class="project-list">
				<form method="post" action="?/deleteProject" use:enhance>
					<ul class="flex gap-3 flex-wrap">
						{#each data.projects as project}
							<Card {project} />
							<!-- <li>
								<a href="/project/{project.id}">{project.name}</a>
								<button name="projectID" value={project.id} type="submit">delete</button>
							</li> -->
						{/each}
					</ul>
				</form>
			</div>
		</div>

		{#if createProject}
			<Modal onClose={closeCreateModal}>
				<h1 slot="title">Create Project</h1>
				<div slot="content" class="w-full">
					<form method="post" action="?/createProject" use:enhance>
						{#if form?.invalidProjectName}
							<p>Invalid project name</p>
						{/if}

						<input name="projectName" placeholder="Project name" />

						<div class="w-full flex flex-row-reverse gap-2">
							<button
								class="
									py-2 px-3	rounded-md
									text-white text-sm font-medium
									bg-blue-600 hover:bg-blue-500
									shadow-sm
									ring-1 ring-blue-600
								"
								type="submit"
							>
								Create Project
							</button>
							<button
								type="button"
								class="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
								on:click={closeCreateModal}
							>
								Cancel
							</button>
						</div>
					</form>
				</div>
			</Modal>
		{/if}
	</div>
{:else}
	<a href="/auth">Sign in</a>
{/if}

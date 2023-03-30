<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import { signOut } from '@auth/sveltekit/client';
	import type { ActionData, PageData } from './$types';

	export let form: ActionData;
	export let data: PageData;
</script>

{#if $page.data.session?.user}
	<div>
		{$page.data.session.user.email}<br />
		<button on:click={() => signOut()}>Sign out</button>
	</div>
	<br />
	<div>
		<form method="post" action="?/createProject" use:enhance>
			{#if form?.invalidProjectName}
				<p>Invalid project name</p>
			{/if}

			<input name="projectName" placeholder="Project name" />
			<button type="submit">Create Project</button>
		</form>
	</div>
	<br />
	<form method="post" action="?/deleteProject" use:enhance>
		<ul>
			{#each data.projects as project}
				<li>
					<a href="/project/{project.id}">{project.name}</a>
					<button name="projectID" value={project.id} type="submit">delete</button>
				</li>
			{/each}
		</ul>
	</form>
{:else}
	<a href="/auth">Sign in</a>
{/if}

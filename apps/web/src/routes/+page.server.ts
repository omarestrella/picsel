import { Automerge } from '$lib/automerge';
import type { Project } from '@packages/shared/types';
import { fail, redirect } from '@sveltejs/kit';
import { createProject, deleteProject, getProjects, supabase } from '../db';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const session = await locals.getSession();
	if (!session?.user?.email) {
		return {
			projects: []
		};
	}
	const projects = await getProjects(session.user.email);
	return {
		projects
	};
}) satisfies PageServerLoad;

export const actions = {
	createProject: async ({ request, locals }) => {
		const formData = await request.formData();
		const projectName = formData.get('projectName');

		if (!projectName || typeof projectName !== 'string') {
			return fail(400, { invalidProjectName: true });
		}

		const session = await locals.getSession();
		if (!session || !session.user?.email) {
			throw redirect(303, '/auth');
		}

		const document = Automerge.from<Project>({
			id: crypto.randomUUID(),
			layers: [{ cells: [], id: crypto.randomUUID(), name: 'Layer 1' }],
			name: projectName,
			size: {
				width: 16,
				height: 16
			}
		} as Project);

		const project = await createProject(
			{ owner: session.user.email, projectName, documentID: document.id },
			Automerge.save(document)
		);

		throw redirect(303, `/project/${project.id}`);
	},
	deleteProject: async ({ request, locals }) => {
		const formData = await request.formData();
		const projectID = formData.get('projectID');

		if (!projectID || typeof projectID !== 'string') {
			return fail(400, { invalidProjectID: true });
		}

		const session = await locals.getSession();
		if (!session || !session.user?.email) {
			throw redirect(303, '/auth');
		}

		await deleteProject(session.user.email, projectID);

		return { success: true };
	}
} satisfies Actions;

import { redirect } from '@sveltejs/kit';
import { getProjectByDocumentID, getDocument } from '../../../db';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, parent }) => {
	const { session } = await parent();
	if (!session?.user?.email) {
		throw redirect(303, '/auth');
	}

	const project = await getProjectByDocumentID(session.user.email, params.project);
	const document = await getDocument(session.user.email, project.document_id);

	return {
		document: Array.from(document),
		project
	};
}) satisfies PageServerLoad;

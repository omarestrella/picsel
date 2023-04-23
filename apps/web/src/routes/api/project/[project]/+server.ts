import type { RequestHandler } from './$types';
import { PUBLIC_SERVER_URL } from '$env/static/public';
import { error } from '@sveltejs/kit';
import { supabase } from '../../../../db';

import type { Config } from '@sveltejs/adapter-vercel';

export const config: Config = {
	runtime: 'edge'
};

export const GET = (async ({ url, params, fetch, locals }) => {
	const { project: projectID } = params;

	const session = await locals.getSession();
	if (!session || !session.user) {
		throw error(401, 'Unauthorized');
	}

	const project = await supabase.from('projects').select().eq('id', projectID).single();
	if (project.error) {
		throw error(500, project.error.message);
	}
	if (project.data?.owner !== session.user.email) {
		throw error(404, 'Not found');
	}

	const res = await fetch(
		`${PUBLIC_SERVER_URL}/documents/${project.data.document_id}/preview?owner=${session.user.email}`
	);
	return new Response(await res.arrayBuffer());
}) satisfies RequestHandler;

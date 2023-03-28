import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ parent }) => {
	const data = await parent();

	if (data.session?.user) {
		throw redirect(303, '/');
	}

	return {};
}) satisfies PageLoad;

import type { PageLoad } from './$types';

export const load = (async ({ fetch, params }) => {
	const res = await fetch(`http://127.0.0.1:3000/documents/${params.project}`);
	const data = await res.arrayBuffer();

	return {
		document: data,
		projectID: params.project
	};
}) satisfies PageLoad;

import type { PageLoad } from './$types';

export const load = (async ({ fetch }) => {
	const res = await fetch('http://127.0.0.1:3000/documents/1234');
	const data = await res.arrayBuffer();

	return {
		document: data
	};
}) satisfies PageLoad;

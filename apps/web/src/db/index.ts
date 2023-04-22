import { createClient, type PostgrestResponse } from '@supabase/supabase-js';

import { SUPABASE_URL } from '$env/static/private';
import { env } from '$env/dynamic/private';
import type { Database } from './supabase';

export const supabase = createClient<Database>(SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

export async function getProjects(email: string, includeData = false) {
	let projects = await supabase.from('projects').select('*').eq('owner', email);

	if (projects.error) {
		throw new Error(projects.error.message);
	}

	const data = projects.data.map((project) => {
		return includeData
			? {
					...project,
					data: []
			  }
			: project;
	});
	return data;
}

export async function getDocument(owner: string, documentID: string) {
	const file = await supabase.storage.from('documents').download(`${owner}/${documentID}`);
	if (file.error) {
		throw new Error(file.error.message);
	}
	if (!file.data) {
		throw new Error('File not found');
	}
	return new Uint8Array(await file.data.arrayBuffer());
}

export async function createProject(
	projectData: { owner: string; projectName: string; documentID: string },
	documentData: Uint8Array
) {
	await supabase.storage
		.from('documents')
		.upload(`${projectData.owner}/${projectData.documentID}`, Buffer.from(documentData), {
			contentType: 'application/octect-stream'
		});

	const project = await supabase
		.from('projects')
		.insert({
			owner: projectData.owner,
			name: projectData.projectName,
			document_id: projectData.documentID
		})
		.select();
	if (project.error) {
		throw new Error(project.error.message);
	}

	return project.data[0];
}

export async function getProject(owner: string, projectID: string) {
	const project = await supabase
		.from('projects')
		.select('*')
		.eq('id', projectID)
		.eq('owner', owner)
		.single();
	if (project.error) {
		throw new Error(project.error.message);
	}
	if (!project.data) {
		throw new Error('Project not found');
	}
	return {
		...project.data
	};
}

export async function deleteProject(owner: string, projectID: string) {
	await supabase.from('projects').delete().eq('id', projectID).eq('owner', owner).single();
}

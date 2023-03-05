import { writable } from 'svelte/store';

export const Tools = {
	pencil: 'pencil',
	fill: 'fill',
	eraser: 'eraser'
} as const;

export type Tool = keyof typeof Tools;

type Store = {
	tool: Tool;
	color: string;
};

function createStore() {
	const store = writable<Store>({
		tool: 'pencil',
		color: 'black'
	});

	return {
		...store,
		setTool(tool: Tool) {
			store.update((store) => ({ ...store, tool }));
		},
		setColor(color: string) {
			store.update((store) => ({ ...store, color }));
		}
	};
}

export const tools = createStore();

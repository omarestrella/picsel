import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: [vitePreprocess()],

	kit: {
		adapter: adapter()
	},

	vitePlugin: {
		experimental: {
			inspector: {
				toggleKeyCombo: 'ctrl+shift',
				holdMode: false,
				showToggleButton: 'always',
				toggleButtonPos: 'bottom-right'
			}
		}
	}
};

export default config;

import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

import socketIOPlugin from "./src/lib/server/socket-io-plugin";

const config: UserConfig = {
	server: {
		proxy: {
			/** Proxying websockets or socket.io */
			'/socket.io': {
			  target: 'ws://localhost:3000',
			  ws: true
			}
		}
	},
	plugins: [sveltekit(),
		{
			name: 'socket-io-plugin',
			configureServer() {
				socketIOPlugin(3000)
			}
		}]
};

export default config;

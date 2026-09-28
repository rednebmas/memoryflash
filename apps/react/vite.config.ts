import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';

const gitSha = () => {
	try {
		return execSync('git rev-parse --short HEAD').toString().trim();
	} catch {
		return 'unknown';
	}
};

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	define: {
		__APP_VERSION__: JSON.stringify(gitSha()),
	},
	server: {
		allowedHosts: ['sd-mbpr.local'],
	},
});

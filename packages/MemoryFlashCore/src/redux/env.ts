const getEnv = (viteVariable: string, nodeVariable: string) => {
	if (typeof window !== 'undefined' && import.meta) {
		return (import.meta as any).env[viteVariable];
	} else if (typeof process !== 'undefined') {
		return process.env[nodeVariable];
	}
};

export const API_BASE_URL = getEnv('VITE_API_BASE_URL', 'API_BASE_URL') || 'http://localhost:3333';

export const IS_PRODUCTION = getEnv('MODE', 'NODE_ENV') === 'production';

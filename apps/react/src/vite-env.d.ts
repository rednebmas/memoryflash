/// <reference types="vite/client" />

declare global {
	interface Window {
		isIosDebugBuild?: boolean;
	}
}

export {};

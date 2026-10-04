declare global {
	interface Window {
		iosDebug?: boolean;
		webkit?: { messageHandlers?: { openSettings?: { postMessage: (body: string) => void } } };
	}
}

export const isIOSApp = (): boolean => Boolean(window.webkit?.messageHandlers?.openSettings);

export const isIOSDebug = (): boolean => Boolean(window.iosDebug);

export const openIOSSettings = () => window.webkit?.messageHandlers?.openSettings?.postMessage('');

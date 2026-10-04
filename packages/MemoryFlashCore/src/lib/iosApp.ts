interface IOSAppHost {
	iosDebug?: boolean;
	webkit?: { messageHandlers?: { openSettings?: { postMessage: (body: string) => void } } };
}

const browser = (): IOSAppHost => window as IOSAppHost;

export const isIOSApp = (host = browser()): boolean =>
	Boolean(host.webkit?.messageHandlers?.openSettings);

export const isIOSDebug = (host = browser()): boolean => Boolean(host.iosDebug);

export const openIOSSettings = (host = browser()) =>
	host.webkit?.messageHandlers?.openSettings?.postMessage('');

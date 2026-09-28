import { toJpeg } from 'html-to-image';

const MAX_WIDTH = 1280;

export const captureScreenshot = async (): Promise<string | undefined> => {
	try {
		const scale = Math.min(1, MAX_WIDTH / window.innerWidth);
		return await toJpeg(document.body, {
			quality: 0.7,
			pixelRatio: scale * Math.min(window.devicePixelRatio, 2),
			filter: (node) => !(node instanceof HTMLElement && node.dataset.bugReportIgnore),
		});
	} catch {
		return undefined;
	}
};

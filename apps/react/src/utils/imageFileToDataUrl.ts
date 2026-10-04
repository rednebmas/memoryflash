import { fitWithin } from 'MemoryFlashCore/src/lib/fitWithin';

const MAX_SIDE = 2000;

const loadImage = (file: File) =>
	new Promise<HTMLImageElement>((resolve, reject) => {
		const url = URL.createObjectURL(file);
		const img = new Image();
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = url;
	});

export async function imageFileToDataUrl(file: File): Promise<string> {
	const img = await loadImage(file);
	URL.revokeObjectURL(img.src);
	const { width, height } = fitWithin(img.naturalWidth, img.naturalHeight, MAX_SIDE);
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
	return canvas.toDataURL('image/jpeg', 0.85);
}

export const firstImageFile = (files?: FileList | null) =>
	Array.from(files ?? []).find((f) => f.type.startsWith('image/'));

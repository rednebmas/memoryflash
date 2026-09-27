export const TONE_MODES = ['off', 'speaker', 'headphones'] as const;
export type ToneMode = (typeof TONE_MODES)[number];

export const TONE_MODE_LABELS: Record<ToneMode, string> = {
	off: 'Off',
	speaker: 'Speaker',
	headphones: 'Headphones',
};

export const DEFAULT_TONE_MS = 1000;
export const TONE_LENGTH_OPTIONS_MS = [500, 1000, 2000, 3000];

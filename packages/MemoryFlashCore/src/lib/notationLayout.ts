const MAX_BARS_PER_LINE = 4;
const MAX_BAR_WIDTH = 300;
export const MIN_BAR_WIDTH = 240;
const MIN_SCALE = 0.7;

export function lineLayout(bars: number, availableWidth: number) {
	const fit = Math.floor(availableWidth / (MIN_BAR_WIDTH * MIN_SCALE));
	const maxPerLine = Math.max(1, Math.min(bars, MAX_BARS_PER_LINE, fit));
	const lines = Math.ceil(bars / maxPerLine);
	const perLine = Math.ceil(bars / lines);
	const barWidth = Math.floor(availableWidth / perLine);
	return {
		perLine,
		lines,
		barWidth: Math.max(MIN_BAR_WIDTH, Math.min(MAX_BAR_WIDTH, barWidth)),
	};
}

export const barSlot = (bar: number, perLine: number) => ({
	line: Math.floor(bar / perLine),
	column: bar % perLine,
	isLineStart: bar % perLine === 0,
});

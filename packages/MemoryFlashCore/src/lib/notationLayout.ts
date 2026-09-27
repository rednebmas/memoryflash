export const MAX_BARS_PER_LINE = 4;

export function barsPerLine(bars: number, availableWidth: number, barWidth: number): number {
	const fit = Math.floor(availableWidth / barWidth);
	return Math.max(1, Math.min(bars, MAX_BARS_PER_LINE, fit));
}

export const barSlot = (bar: number, perLine: number) => ({
	line: Math.floor(bar / perLine),
	column: bar % perLine,
	isLineStart: bar % perLine === 0,
});

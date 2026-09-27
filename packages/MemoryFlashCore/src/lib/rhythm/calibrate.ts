import { calculateMedian } from '../median';

export function calibrationOffsetMs(clickTimes: number[], tapTimes: number[]): number | null {
	if (clickTimes.length === 0 || tapTimes.length === 0) return null;
	const offsets = tapTimes.map((tap) =>
		clickTimes.reduce(
			(best, click) => (Math.abs(tap - click) < Math.abs(best) ? tap - click : best),
			Infinity,
		),
	);
	return Math.round(calculateMedian(offsets));
}

import { normalizeTimezone, oneDayInMillis } from '../util/dates';

export const getActivityDayKey = (date: Date, timezone?: string) => {
	const tz = normalizeTimezone(timezone);
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone: tz,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		hour12: false,
	}).formatToParts(date);
	const map = Object.fromEntries(
		parts.filter((p) => p.type !== 'literal').map((p) => [p.type, p.value]),
	) as Record<string, string>;
	const midnightUtc = Date.UTC(Number(map.year), Number(map.month) - 1, Number(map.day));
	const adjusted = Number(map.hour) < 3 ? midnightUtc - oneDayInMillis : midnightUtc;
	return new Date(adjusted).toISOString().slice(0, 10);
};

export const dayGap = (start: string, end: string) => {
	const startIndex = Math.floor(Date.parse(`${start}T00:00:00Z`) / oneDayInMillis);
	const endIndex = Math.floor(Date.parse(`${end}T00:00:00Z`) / oneDayInMillis);
	return endIndex - startIndex;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export const formatDue = (due: string, now: number): string => {
	const days = Math.max(0, Math.ceil((new Date(due).getTime() - now) / DAY_MS));
	return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(days, 'day');
};

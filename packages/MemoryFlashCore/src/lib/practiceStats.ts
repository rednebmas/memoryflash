import { CardStats } from '../types/StatsByCardType';

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

const practicedLabel = (iso: string, now: Date) => {
	const days = Math.round((startOfDay(now) - startOfDay(new Date(iso))) / DAY_MS);
	if (days <= 0) return 'practiced today';
	if (days === 1) return 'practiced yesterday';
	return `practiced ${days} days ago`;
};

export const practiceStatsLabel = (stats: CardStats | undefined, now: Date) => {
	if (!stats) return 'Not practiced yet';
	const attempts = `${stats.attempts} attempt${stats.attempts === 1 ? '' : 's'}`;
	return `${attempts} · ${practicedLabel(stats.lastAttemptedAt, now)}`;
};

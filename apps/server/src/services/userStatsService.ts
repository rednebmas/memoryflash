import { AttemptDoc } from '../models/Attempt';
import { UserStats, UserStatsDoc } from '../models/UserStats';
import { oneDayInMillis } from '../utils/dates';

const DEFAULT_TIMEZONE = 'UTC';

const normalizeTimezone = (timezone?: string) => {
	const trimmed = timezone?.trim();
	if (!trimmed) return DEFAULT_TIMEZONE;
	try {
		new Intl.DateTimeFormat('en-US', { timeZone: trimmed });
		return trimmed;
	} catch {
		return DEFAULT_TIMEZONE;
	}
};

const dayKeyFromUTC = (utcMs: number) => new Date(utcMs).toISOString().slice(0, 10);

const getActivityDayInfo = (date: Date, timeZone: string) => {
	const tz = normalizeTimezone(timeZone);
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone: tz,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		hour12: false,
	}).formatToParts(date);
	const map = Object.fromEntries(
		parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]),
	) as Record<string, string>;
	const midnightUtc = Date.UTC(
		Number(map.year),
		Number(map.month) - 1,
		Number(map.day),
	);
	const adjustedUtc = Number(map.hour) < 3 ? midnightUtc - oneDayInMillis : midnightUtc;
	return {
		dayKey: dayKeyFromUTC(adjustedUtc),
		dayIndex: Math.floor(adjustedUtc / oneDayInMillis),
	};
};

export const getActivityDay = (date: Date, timeZone: string) =>
	getActivityDayInfo(date, timeZone).dayKey;

const daysBetween = (start: string, end: string) => {
	const startIndex = Math.floor(Date.parse(`${start}T00:00:00Z`) / oneDayInMillis);
	const endIndex = Math.floor(Date.parse(`${end}T00:00:00Z`) / oneDayInMillis);
	return endIndex - startIndex;
};

export const getOrCreateUserStats = async (userId: string, timezone?: string) => {
	const existing = await UserStats.findOne({ userId });
	const resolvedTimezone = normalizeTimezone(timezone ?? existing?.timezone);
	if (existing) {
		if (existing.timezone !== resolvedTimezone) {
			existing.timezone = resolvedTimezone;
			await existing.save();
		}
		return existing;
	}
	const stats = new UserStats({
		userId,
		timezone: resolvedTimezone,
	});
	return stats.save();
};

export const updateStreakForAttempt = async (
	attempt: AttemptDoc,
	timezoneOverride?: string,
): Promise<UserStatsDoc> => {
	const attemptedAt = attempt.attemptedAt ?? new Date();
	const stats = await getOrCreateUserStats(attempt.userId.toString(), timezoneOverride);
	const tz = stats.timezone || DEFAULT_TIMEZONE;
	const { dayKey: activityDay } = getActivityDayInfo(attemptedAt, tz);
	if (stats.lastActivityDate === activityDay) return stats;
	if (stats.lastActivityDate) {
		const gap = daysBetween(stats.lastActivityDate, activityDay);
		if (gap <= 0) return stats;
		stats.currentStreak = gap === 1 ? stats.currentStreak + 1 : 1;
	} else {
		stats.currentStreak = 1;
	}
	if (stats.currentStreak > stats.longestStreak) {
		stats.longestStreak = stats.currentStreak;
	}
	stats.lastActivityDate = activityDay;
	return stats.save();
};

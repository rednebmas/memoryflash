import { createSelector } from '@reduxjs/toolkit';
import { ReduxState } from '../store';
import { Attempt } from '../../types/Attempt';
import { getActivityDayKey } from '../util/activityDay';

export interface StreakDayGroup {
	day: string;
	formattedDay: string;
	attempts: StreakAttempt[];
}

export interface StreakAttempt {
	_id: string;
	formattedTime: string;
	correct: boolean;
	timeTaken: number;
}

const formatDay = (day: string) => {
	const date = new Date(day + 'T12:00:00Z');
	return date.toLocaleDateString(undefined, {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
};

const formatTime = (attemptedAt: string) =>
	new Date(attemptedAt).toLocaleTimeString(undefined, {
		hour: 'numeric',
		minute: '2-digit',
	});

const selectAttempts = (state: ReduxState) => state.attempts.entities;
const selectUserStats = (state: ReduxState) => state.userStats.userStats;

export const streakActivitySelector = createSelector(
	[selectAttempts, selectUserStats],
	(attemptsEntities, userStats): StreakDayGroup[] => {
		const timezone = userStats?.timezone;
		const attempts = Object.values(attemptsEntities).filter(
			(a): a is Attempt => a !== undefined,
		);

		const grouped: Record<string, Attempt[]> = {};
		attempts.forEach((attempt) => {
			const day = getActivityDayKey(new Date(attempt.attemptedAt), timezone);
			if (!grouped[day]) grouped[day] = [];
			grouped[day].push(attempt);
		});

		return Object.entries(grouped)
			.map(([day, dayAttempts]) => ({
				day,
				formattedDay: formatDay(day),
				attempts: dayAttempts
					.sort(
						(a, b) =>
							new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime(),
					)
					.map((attempt) => ({
						_id: attempt._id,
						formattedTime: formatTime(attempt.attemptedAt),
						correct: attempt.correct,
						timeTaken: attempt.timeTaken,
					})),
			}))
			.sort((a, b) => b.day.localeCompare(a.day));
	},
);

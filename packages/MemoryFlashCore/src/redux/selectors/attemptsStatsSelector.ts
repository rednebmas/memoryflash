import { createSelector } from '@reduxjs/toolkit';
import { clamp } from '../../lib/clamp';
import { calculateMedian } from '../../lib/median';
import { UserDeckStatsType } from '../../types/UserDeckStats';
import {
	currDeckAllWithAttemptsSelector,
	currDeckWithAttemptsSelector,
	currDeckWithCorrectAttemptsSelector,
} from './currDeckCardsWithAttempts';
import { userDeckStatsByDeckIdSelector } from './userDeckStatsByDeckIdSelector';

const formatDateKey = (dateInput: string | number | Date): string => {
	const date = new Date(dateInput);
	const year = date.getFullYear();
	const month = `${date.getMonth() + 1}`.padStart(2, '0');
	const day = `${date.getDate()}`.padStart(2, '0');
	return `${year}-${month}-${day}`;
};

export const timeSpentPerDaySelector = createSelector(
	[currDeckAllWithAttemptsSelector],
	(cards) => {
		const timeSpentPerDay: { [date: string]: number } = {};

		Object.values(cards).forEach((card) => {
			card.attempts.forEach((attempt) => {
				const dateKey = formatDateKey(attempt.attemptedAt);
				timeSpentPerDay[dateKey] = (timeSpentPerDay[dateKey] ?? 0) + attempt.timeTaken;
			});
		});

		return timeSpentPerDay;
	},
);

export const medianPerDaySelector = createSelector(
	[userDeckStatsByDeckIdSelector, currDeckWithCorrectAttemptsSelector],
	(userDeckStatsByDeckId, currentDeck) => {
		if (Object.keys(currentDeck).length === 0) {
			return {};
		}

		const deckId = Object.values(currentDeck)[0]?.deckId;
		const stats: UserDeckStatsType | undefined = userDeckStatsByDeckId[deckId];

		const medianPerDay: { [date: string]: number } = {};

		if (stats && stats.medianHistory) {
			stats.medianHistory.forEach((entry) => {
				const dateStr = formatDateKey(entry.date);
				medianPerDay[dateStr] = entry.median;
			});
		}

		return medianPerDay;
	},
);

export const attemptsStatsSelector = createSelector(
	[
		currDeckWithCorrectAttemptsSelector,
		userDeckStatsByDeckIdSelector,
		timeSpentPerDaySelector,
		medianPerDaySelector,
	],
	(currentDeck, userDeckStatsByDeckId, timeSpentPerDay, medianPerDay) => {
		if (Object.keys(currentDeck).length === 0) {
			return undefined;
		}

		const deckId = Object.values(currentDeck)[0]?.deckId;
		const stats: UserDeckStatsType | undefined = userDeckStatsByDeckId[deckId];

		// Compute totalTimeSpent
		const totalTimeSpent = Object.values(timeSpentPerDay).reduce(
			(total, time) => total + time,
			0,
		);

		const timeTaken: number[] = Object.values(currentDeck)
			.map((c) => c.attempts[0]?.timeTaken)
			.filter((c) => c !== undefined);

		// Calculate mean, median, and std
		const mean =
			timeTaken.length > 0 ? timeTaken.reduce((a, b) => a + b, 0) / timeTaken.length : 0;
		const median = timeTaken.length > 0 ? calculateMedian([...timeTaken]) : 0;
		const std =
			timeTaken.length > 0
				? Math.sqrt(
						timeTaken.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) /
							timeTaken.length,
					)
				: 0;

		const tooLongTime = median * 2;

		return {
			mean,
			median,
			std,
			tooLongTime,
			length: timeTaken.length,
			numCards: Object.keys(currentDeck).length,
			numCardsWithCorrectAnswer: timeTaken.length,
			medianHistory: stats?.medianHistory || [],
			totalTimeSpent,
			timeSpentPerDay,
			medianPerDay,
		};
	},
);

export const bpmSelector = createSelector(
	[attemptsStatsSelector, currDeckWithAttemptsSelector],
	(stats, currentDeck) => {
		if (!stats || !stats.median) return { bpm: 40, goalTime: 0 }; // Default BPM if stats are not available

		console.log('[bpm] median: ', stats.median);

		let originalBpm = 60 / stats.median; //  * learningSpeed);
		console.log('[bpm] originalBpm: ', originalBpm);

		let bpm = originalBpm || 40;
		let octaveMultiplier = 0;
		while (bpm < 40) {
			bpm *= 4;
			octaveMultiplier++;
		}

		console.log('[bpm] bpm:', bpm, ', octaveMultiplier: ', octaveMultiplier);

		console.log('[bpm] stats.numCardsWithCorrectAnswer:', stats.numCardsWithCorrectAnswer);

		let correct = 0;
		let incorrect = 0;
		let sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
		Object.values(currentDeck)
			.map((card) => card.attempts)
			.flat()
			.forEach((attempt) => {
				let attemptedDate = new Date(attempt.attemptedAt);

				// the six hour ago filter also occurs on the server
				if (attempt.correct && attemptedDate > sixHoursAgo) {
					correct++;
				} else if (attempt.correct === false) {
					incorrect++;
				}
			});

		console.log('[bpm] correct bonus:', correct, '- incorrect penalty:', incorrect);

		let adjustment = clamp(-incorrect * 1.5 + correct, -10, 10);
		console.log('[bpm] adjustment:', adjustment);

		bpm += adjustment;

		bpm = clamp(bpm, 39, 161);

		console.log('[bpm] final bpm:', bpm);

		return {
			bpm: Math.round(bpm),
			goalTime: (60 / bpm) * Math.pow(4, octaveMultiplier),
		};
	},
);

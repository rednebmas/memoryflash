import { createSelector } from 'reselect';
import { ReduxState } from '../store';
import { UserDeckStatsType } from '../../types/UserDeckStats';

export const userDeckStatsByDeckIdSelector = createSelector(
	[(state: ReduxState) => state.userDeckStats],
	(userDeckStats) => {
		const userDeckStatsByDeckId: { [deckId: string]: UserDeckStatsType } = {};

		Object.values(userDeckStats.entities).forEach((stats) => {
			userDeckStatsByDeckId[stats.deckId as string] = stats;
		});

		return userDeckStatsByDeckId;
	},
);

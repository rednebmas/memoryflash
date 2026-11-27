import { activeSkippedCardsSelector } from '../selectors/skippedCardsSelector';
import { schedulerActions } from '../slices/schedulerSlice';
import { userDeckStatsActions } from '../slices/userDeckStatsSlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';
import { schedule } from './schedule-cards-action';

export const skipCard =
	(deckId: string, cardId: string): AppThunk =>
	async (dispatch, getState, { api }) => {
		const skippedCards = {
			...activeSkippedCardsSelector(getState()),
			[cardId]: new Date().toISOString(),
		};
		await networkCallWithReduxState(dispatch, 'skipCard', async () => {
			const res = await api.patch(`/decks/${deckId}/skipped-cards`, { skippedCards });
			dispatch(userDeckStatsActions.upsert([res.data.stats]));
			dispatch(schedulerActions.removeCard(cardId));
			dispatch(schedule(deckId));
		});
	};

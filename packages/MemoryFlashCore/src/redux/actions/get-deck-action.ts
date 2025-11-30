import { attemptsActions } from '../slices/attemptsSlice';
import { cardsActions } from '../slices/cardsSlice';
import { coursesActions } from '../slices/coursesSlice';
import { decksActions } from '../slices/decksSlice';
import { userDeckStatsActions } from '../slices/userDeckStatsSlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';

export const getDeck =
	(deckId: string): AppThunk =>
	async (dispatch, getState, { api }) => {
		if (getState().network._['getDeck' + deckId]?.isLoading) return; // mostly due to StrictMode
		await networkCallWithReduxState(dispatch, 'getDeck' + deckId, async () => {
			const res = await api.get('/decks/' + deckId);
			dispatch(cardsActions.upsert(res.data.cards));
			dispatch(attemptsActions.upsert(res.data.attempts));
			dispatch(decksActions.upsert([res.data.deck]));
			dispatch(coursesActions.upsert([res.data.course]));
			if (res.data.userDeckStats) {
				dispatch(userDeckStatsActions.upsert([res.data.userDeckStats]));
			}
		});
	};

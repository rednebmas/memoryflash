import { decksActions } from '../slices/decksSlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';
import { Deck } from '../../types/Deck';

export const createDeck =
	(courseId: string, name: string, options?: { successCb?: (deck: Deck) => void }): AppThunk =>
	async (dispatch, _, { api }) => {
		await networkCallWithReduxState(dispatch, 'createDeck', async () => {
			const res = await api.post('/decks', { courseId, name });
			dispatch(decksActions.upsert([res.data.deck]));
			options?.successCb?.(res.data.deck);
		});
	};

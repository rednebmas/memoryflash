import { cardsActions } from '../slices/cardsSlice';
import { attemptsActions } from '../slices/attemptsSlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';

export const deleteCard =
	(cardId: string): AppThunk =>
	async (dispatch, getState, { api }) => {
		await networkCallWithReduxState(dispatch, 'deleteCard', async () => {
			await api.delete('/cards/' + cardId);
			const ids = Object.values(getState().attempts.entities)
				.filter((a) => a?.cardId === cardId)
				.map((a) => a!._id);
			dispatch(attemptsActions.removeMany(ids));
			dispatch(cardsActions.remove(cardId));
		});
	};

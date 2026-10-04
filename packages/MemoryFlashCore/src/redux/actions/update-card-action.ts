import { cardsActions } from '../slices/cardsSlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';
import { MultiSheetQuestion } from '../../types/MultiSheetCard';
import { Answer } from '../../types/Cards';

export const updateCard =
	(
		cardId: string,
		question: MultiSheetQuestion,
		answer?: Answer,
		onSuccess?: () => void,
	): AppThunk =>
	async (dispatch, _, { api }) => {
		await networkCallWithReduxState(
			dispatch,
			'updateCard',
			async () => {
				const res = await api.patch('/cards/' + cardId, { question, answer });
				dispatch(cardsActions.upsert([res.data.card]));
			},
			{ successCb: onSuccess },
		);
	};

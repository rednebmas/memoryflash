import { cardsActions } from '../slices/cardsSlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';
import { MultiSheetQuestion } from '../../types/MultiSheetCard';
import { CardTypeEnum } from '../../types/Cards';

function prepareQuestion(
	question: MultiSheetQuestion,
	cardType: string,
	textPrompt?: string,
): MultiSheetQuestion {
	if (cardType === 'Text Prompt' || cardType === 'Chord Memory') {
		return {
			...question,
			presentationModes: [{ id: 'Text Prompt', text: textPrompt ?? '' }],
		} as any;
	}
	return question;
}

export const updateCard =
	(
		cardId: string,
		question: MultiSheetQuestion,
		cardType: CardTypeEnum | string,
		textPrompt?: string,
	): AppThunk =>
	async (dispatch, _, { api }) => {
		await networkCallWithReduxState(dispatch, 'updateCard', async () => {
			const q = prepareQuestion(question, cardType, textPrompt);
			const res = await api.patch('/cards/' + cardId, { question: q });
			dispatch(cardsActions.upsert([res.data.card]));
		});
	};

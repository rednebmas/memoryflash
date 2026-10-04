import { cardsActions } from '../slices/cardsSlice';
import { AppThunk, ReduxState } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';
import { selectHiddenCardIds } from '../selectors/currDeckCardsWithAttempts';
import { MultiSheetQuestion } from '../../types/MultiSheetCard';
import { Answer, Card } from '../../types/Cards';
import {
	SheetCard,
	groupMembers,
	hiddenAfter,
	newGroupId,
	planGroupSave,
} from '../../lib/transpositionGroups';
import { addCardsToDeck } from './add-cards-to-deck';
import { updateHiddenCards } from './update-hidden-cards-action';

const planFor = (
	state: ReduxState,
	cardId: string,
	editedKey: string,
	previews: MultiSheetQuestion[],
) => {
	const source = state.cards.entities[cardId] as SheetCard;
	const hiddenIds = selectHiddenCardIds(state, source.deckId);
	const members = groupMembers(Object.values(state.cards.entities), source);
	return {
		deckId: source.deckId,
		hiddenIds,
		plan: planGroupSave(members, hiddenIds, source, previews, editedKey),
		transpositionGroup:
			source.transpositionGroup ?? (previews.length > 1 ? newGroupId() : undefined),
	};
};

export const saveTranspositionGroup =
	(
		cardId: string,
		editedKey: string,
		previews: MultiSheetQuestion[],
		answer?: Answer,
		onSuccess?: () => void,
	): AppThunk =>
	async (dispatch, getState, { api }) => {
		const { deckId, hiddenIds, plan, transpositionGroup } = planFor(
			getState(),
			cardId,
			editedKey,
			previews,
		);
		const patch = async (id: string, question: MultiSheetQuestion) => {
			const body = { question, answer, transpositionGroup };
			return (await api.patch<{ card: Card }>(`/cards/${id}`, body)).data.card;
		};
		const save = async () => {
			const cards = await Promise.all(plan.updates.map((u) => patch(u.id, u.question)));
			dispatch(cardsActions.upsert(cards));
			const groups = plan.add.map(() => transpositionGroup);
			await Promise.all([
				plan.add.length &&
					dispatch(addCardsToDeck(deckId, plan.add, answer, undefined, groups)),
				(plan.hide.length || plan.unhide.length) &&
					dispatch(updateHiddenCards(deckId, hiddenAfter(hiddenIds, plan))),
			]);
		};
		await networkCallWithReduxState(dispatch, 'updateCard', save, { successCb: onSuccess });
	};

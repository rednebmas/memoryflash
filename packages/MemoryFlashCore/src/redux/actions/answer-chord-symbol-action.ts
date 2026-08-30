import { ChordMemoryValidatorEngine } from '../../lib/ChordMemoryValidatorEngine';
import { AnswerType, ChordMemoryAnswer } from '../../types/Cards';
import { sessionCardsSelector } from '../selectors/scheduledCardsSelector';
import { SyncAppThunk } from '../store';

export const answerChordSymbol =
	(symbol: string, onResult: (correct: boolean) => void): SyncAppThunk =>
	(dispatch, getState) => {
		const state = getState();
		const { cards, index } = sessionCardsSelector(state);
		const card = cards[index];
		if (!card || card.answer.type !== AnswerType.ChordMemory) return;
		const answer = card.answer as ChordMemoryAnswer;
		const engine = new ChordMemoryValidatorEngine(answer.chords);
		const correct = engine.handleSymbol(
			symbol,
			answer.notation ?? 'chordNames',
			state.scheduler.multiPartCardIndex,
			dispatch,
			answer.key,
		);
		onResult(correct);
	};

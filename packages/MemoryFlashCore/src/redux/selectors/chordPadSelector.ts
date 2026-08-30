import { createSelector } from '@reduxjs/toolkit';
import { ReduxState } from '../store';
import { AnswerType, ChordMemoryAnswer } from '../../types/Cards';
import { sessionCardsSelector } from './scheduledCardsSelector';
import { displayChordSymbol } from '../../lib/romanNumerals';
import { padRows } from '../../lib/chordPad';

const currentChordMemoryAnswerSelector = createSelector(
	[sessionCardsSelector],
	({ cards, index }) => {
		const answer = cards[index]?.answer;
		return answer?.type === AnswerType.ChordMemory ? (answer as ChordMemoryAnswer) : null;
	},
);

export const chordPadSelector = createSelector(
	[currentChordMemoryAnswerSelector, (state: ReduxState) => state.scheduler.multiPartCardIndex],
	(answer, index) => {
		const notation = answer?.notation ?? 'chordNames';
		const chords = answer?.chords ?? [];
		return {
			notation,
			key: answer?.key,
			total: chords.length,
			committed: answer
				? chords.slice(0, index).map((c) => displayChordSymbol(c, answer))
				: [],
			rows: padRows(notation, answer?.key),
		};
	},
);

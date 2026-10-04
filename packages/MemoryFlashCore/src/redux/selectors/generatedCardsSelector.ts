import { createSelector } from '@reduxjs/toolkit';
import { ReduxState } from '../store';
import { AnswerType, ChordMemoryAnswer } from '../../types/Cards';
import { GeneratedCard } from '../../types/GeneratedCards';
import { chordMemoryQuestion, getDefaultChordMemoryChord } from '../../lib/chordTones';

export const chordMemoryAnswer = (card: GeneratedCard): ChordMemoryAnswer => ({
	type: AnswerType.ChordMemory,
	chords: card.chords.map(getDefaultChordMemoryChord),
	key: card.key,
	notation: card.notation,
});

export const selectedGeneratedCardsSelector = createSelector(
	[(state: ReduxState) => state.generatedCards],
	({ song, selected }) => (song?.cards ?? []).filter((_, i) => selected[i]),
);

export const generatedCardsPayloadSelector = createSelector(
	[selectedGeneratedCardsSelector],
	(cards) => ({
		questions: cards.map((c) => chordMemoryQuestion(c.prompt, c.key)),
		answers: cards.map(chordMemoryAnswer),
	}),
);

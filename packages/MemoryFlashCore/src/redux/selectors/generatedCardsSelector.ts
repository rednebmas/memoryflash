import { createSelector } from '@reduxjs/toolkit';
import { ReduxState } from '../store';
import { AnswerType, ChordMemoryAnswer } from '../../types/Cards';
import { MultiSheetQuestion } from '../../types/MultiSheetCard';
import { StaffEnum } from '../../types/Cards';
import { GeneratedCard } from '../../types/GeneratedCards';
import { getDefaultChordMemoryChord } from '../../lib/chordTones';
import { parseKey } from '../../lib/romanNumerals';

export const chordMemoryQuestion = (prompt: string, key: string): MultiSheetQuestion => ({
	key: parseKey(key).tonic,
	voices: [{ staff: StaffEnum.Treble, stack: [{ notes: [], duration: 'w', rest: true }] }],
	presentationModes: [{ id: 'Text Prompt', text: prompt }],
});

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

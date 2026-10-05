import { createSelector } from '@reduxjs/toolkit';
import { ReduxState } from '../store';
import { Answer, AnswerType, ChordMemoryAnswer } from '../../types/Cards';
import { GeneratedCard, GeneratedChordCard, GenerationStage } from '../../types/GeneratedCards';
import { Generation } from '../slices/generatedCardsSlice';
import { chordMemoryQuestion, getDefaultChordMemoryChord } from '../../lib/chordTones';

const chordMemoryAnswer = (card: GeneratedChordCard): ChordMemoryAnswer => ({
	type: AnswerType.ChordMemory,
	chords: card.chords.map(getDefaultChordMemoryChord),
	key: card.key,
	notation: card.notation,
});

const questionFor = (card: GeneratedCard) =>
	card.type === 'Chord Memory' ? chordMemoryQuestion(card.prompt, card.key) : card.question;

const answerFor = (card: GeneratedCard): Answer =>
	card.type === 'Chord Memory' ? chordMemoryAnswer(card) : { type: AnswerType.ExactMulti };

export const selectedGeneratedCardsSelector = createSelector(
	[(state: ReduxState) => state.generatedCards],
	({ song, selected }) => (song?.cards ?? []).filter((_, i) => selected[i]),
);

export const generatedCardsPayloadSelector = createSelector(
	[selectedGeneratedCardsSelector],
	(cards) => ({ questions: cards.map(questionFor), answers: cards.map(answerFor) }),
);

const uploadingText = ({ hasImage, uploadPercent }: Generation) =>
	`${hasImage ? 'Uploading photo' : 'Sending'}… ${uploadPercent}%`;

const STAGE_TEXT: Record<GenerationStage, (g: Generation) => string> = {
	uploading: uploadingText,
	generating: () => 'Generating… this usually takes about a minute',
	building: () => 'Building previews…',
};

export const generationStatusSelector = (state: ReduxState) => {
	const generation = state.generatedCards.generation;
	return generation && STAGE_TEXT[generation.stage](generation);
};

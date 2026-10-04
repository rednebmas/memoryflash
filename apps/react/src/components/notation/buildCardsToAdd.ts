import { MultiSheetQuestion } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { Answer, AnswerType, ChordMemoryAnswer } from 'MemoryFlashCore/src/types/Cards';
import { PresentationModeIds } from 'MemoryFlashCore/src/types/PresentationMode';
import { NotationSettingsState } from './defaultSettings';
import { presentationModesFor } from 'MemoryFlashCore/src/lib/presentationMode';
import { segmentQuestion } from 'MemoryFlashCore/src/lib/recording/bars';

export interface CardsToAdd {
	questions: MultiSheetQuestion[];
	answer?: Answer;
	presentationMode: PresentationModeIds;
}

export function chordMemoryAnswerFromSettings(settings: NotationSettingsState): ChordMemoryAnswer {
	const { chordTones, key, notation } = settings.chordMemory;
	return {
		type: AnswerType.ChordMemory,
		chords: chordTones,
		key: key || undefined,
		notation: key ? notation : 'chordNames',
	};
}

export function textPromptFor(settings: NotationSettingsState): string {
	if (settings.cardType === 'Chord Memory') {
		return settings.textPrompt || settings.chordMemory.progression;
	}
	return settings.textPrompt;
}

const presentationModes = (settings: NotationSettingsState) =>
	presentationModesFor(settings.cardType, textPromptFor(settings), settings.displayModes);

export const withPresentationModes = (
	question: MultiSheetQuestion,
	settings: NotationSettingsState,
): MultiSheetQuestion => ({ ...question, presentationModes: presentationModes(settings) });

const segmentAll = (previews: MultiSheetQuestion[], sizes: number[]) =>
	sizes.length
		? sizes.flatMap((size) => previews.flatMap((q) => segmentQuestion(q, size)))
		: previews;

export function buildCardsToAdd(
	settings: NotationSettingsState,
	allPreviews: MultiSheetQuestion[],
): CardsToAdd {
	const isChordMemory = settings.cardType === 'Chord Memory';
	const previews = isChordMemory ? allPreviews : segmentAll(allPreviews, settings.segmentBars);
	const questions = previews.map((q) => withPresentationModes(q, settings));
	const answer = isChordMemory ? chordMemoryAnswerFromSettings(settings) : undefined;
	return { questions, answer, presentationMode: presentationModes(settings)[0].id };
}

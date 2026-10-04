import { MultiSheetQuestion } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { Answer, AnswerType, ChordMemoryAnswer } from 'MemoryFlashCore/src/types/Cards';
import { PresentationModeIds } from 'MemoryFlashCore/src/types/PresentationMode';
import { NotationSettingsState } from './defaultSettings';
import { presentationModeFor } from 'MemoryFlashCore/src/lib/presentationMode';
import { linkAcrossKeys } from 'MemoryFlashCore/src/lib/transpositionGroups';
import { segmentQuestion } from 'MemoryFlashCore/src/lib/recording/bars';

export interface CardsToAdd {
	questions: MultiSheetQuestion[];
	answer?: Answer;
	groups: (string | undefined)[];
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

const presentationMode = (settings: NotationSettingsState) =>
	presentationModeFor(settings.cardType, textPromptFor(settings));

export const withPresentationMode = (
	question: MultiSheetQuestion,
	settings: NotationSettingsState,
): MultiSheetQuestion => ({ ...question, presentationModes: [presentationMode(settings)] });

const segmentAll = (previews: MultiSheetQuestion[], sizes: number[]) =>
	linkAcrossKeys(
		previews.map((q) =>
			sizes.length ? sizes.flatMap((size) => segmentQuestion(q, size)) : [q],
		),
	);

export const answerFor = (settings: NotationSettingsState) =>
	settings.cardType === 'Chord Memory' ? chordMemoryAnswerFromSettings(settings) : undefined;

export function buildCardsToAdd(
	settings: NotationSettingsState,
	allPreviews: MultiSheetQuestion[],
): CardsToAdd {
	const isChordMemory = settings.cardType === 'Chord Memory';
	const { questions, groups } = segmentAll(
		allPreviews,
		isChordMemory ? [] : settings.segmentBars,
	);
	return {
		questions: questions.map((q) => withPresentationMode(q, settings)),
		answer: answerFor(settings),
		groups,
		presentationMode: presentationMode(settings).id,
	};
}

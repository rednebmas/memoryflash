import { MultiSheetQuestion } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { Answer, AnswerType, ChordMemoryAnswer } from 'MemoryFlashCore/src/types/Cards';
import { PresentationModeIds } from 'MemoryFlashCore/src/types/PresentationMode';
import { NotationSettingsState } from './defaultSettings';
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

const withMode = (previews: MultiSheetQuestion[], mode: PresentationModeIds, text: string) =>
	previews.map((q) => ({
		...q,
		presentationModes: [
			mode === 'Text Prompt' ? { id: mode, text } : { id: 'Sheet Music' as const },
		],
	}));

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
	if (settings.cardType === 'Sheet Music') {
		return {
			questions: withMode(previews, 'Sheet Music', ''),
			presentationMode: 'Sheet Music',
		};
	}
	const questions = withMode(previews, 'Text Prompt', textPromptFor(settings));
	const answer = isChordMemory ? chordMemoryAnswerFromSettings(settings) : undefined;
	return { questions, answer, presentationMode: 'Text Prompt' };
}

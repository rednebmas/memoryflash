import { majorKeys } from 'MemoryFlashCore/src/lib/notes';
import { writtenChordNames } from 'MemoryFlashCore/src/lib/chordNames';
import { AnswerType, ChordMemoryAnswer } from 'MemoryFlashCore/src/types/Cards';
import { MultiSheetCard } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { CardType } from '../CardTypeDropdown';
import { ChordMemorySettings, NotationSettingsState } from './defaultSettings';

const cardTypeOf = (card: MultiSheetCard): CardType => {
	if (card.answer.type === AnswerType.ChordMemory) return 'Chord Memory';
	const modes = card.question.presentationModes ?? [];
	if (modes.some((m) => m.id === 'Text Prompt')) return 'Text Prompt';
	return 'Sheet Music';
};

const chordMemoryOf = (answer: ChordMemoryAnswer): ChordMemorySettings => ({
	progression: answer.chords.map((c) => c.chordName).join(' '),
	chordTones: answer.chords,
	key: answer.key ?? '',
	notation: answer.notation ?? 'chordNames',
});

export function settingsFromCard(
	card: MultiSheetCard,
	prev: NotationSettingsState,
	transpositionKeys: string[],
): NotationSettingsState {
	const { question, answer } = card;
	const text = question.presentationModes?.find((p) => p.id === 'Text Prompt');
	return {
		...prev,
		keySig: question.key,
		beatsPerBar: question.beatsPerBar ?? 4,
		selected: majorKeys.map((key) => key === question.key || transpositionKeys.includes(key)),
		cardType: cardTypeOf(card),
		textPrompt: text && 'text' in text ? text.text : '',
		preview: !!text,
		chordMemory:
			answer.type === AnswerType.ChordMemory
				? chordMemoryOf(answer as ChordMemoryAnswer)
				: prev.chordMemory,
		chordNames: writtenChordNames(question),
	};
}

import { AnswerType, CardTypeEnum, StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import { MultiSheetCard, StackedNotes, Voice } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { Midi } from 'tonal';
import { PresentationMode } from 'MemoryFlashCore/src/types/PresentationMode';
import { generateProgressionsFromRomanNumerals } from './ii-V-i/ii-V-I-progression-generators';

const presentationModes: PresentationMode[] = [
	{ id: 'Sheet Music' },
	{ id: 'Sheet Music w/ Chords' },
	{ id: 'Chords' },
];

const sortNotes = (notes: StackedNotes['notes']) =>
	[...notes].sort((a, b) => Midi.toMidi(a.name + a.octave)! - Midi.toMidi(b.name + b.octave)!);

const sliceStack = (stack: StackedNotes[], start: number, end?: number) =>
	stack.map((s) => ({ ...s, notes: sortNotes(s.notes.slice(start, end)) }));

export const splitHands = (stack: StackedNotes[], numBassNotes: number): Voice[] => [
	{ stack: sliceStack(stack, numBassNotes), staff: StaffEnum.Treble },
	{ stack: sliceStack(stack, 0, numBassNotes), staff: StaffEnum.Bass },
];

export function createTwoHandedCardsFromProgressions(
	uid: string,
	textAboveKeySig: string,
	textAboveChord: string,
	numBassNotes: number,
	progressions: ReturnType<typeof generateProgressionsFromRomanNumerals>,
) {
	return progressions.map((progression): MultiSheetCard => {
		return {
			uid: `${progression.chords.join(' ')} ${uid}`,
			type: CardTypeEnum.MultiSheet,
			question: {
				key: progression.key,
				voices: splitHands(progression.voice, numBassNotes),
				presentationModes: [
					...presentationModes,
					{
						id: 'Key Signature Only',
						textAbove: textAboveKeySig,
					},
					{
						id: 'First Chord Only',
						textAbove: textAboveChord,
					},
				],
			},
			answer: {
				type: AnswerType.ExactMulti,
			},
		};
	});
}

import { Chord, Interval, Key, Midi } from 'tonal';
import { AnswerType, Card, CardTypeEnum, ChordMemoryAnswer } from '../types/Cards';
import { MultiSheetQuestion } from '../types/MultiSheetCard';
import { chordMemoryQuestion, getDefaultChordMemoryChord } from './chordTones';
import { durationBeats } from './measure';
import { majorKeys } from './notes';
import { chordNameToRomanNumeral, prettyChordSymbol } from './romanNumerals';
import { NoteEvent, activeNotesAt, buildScoreTimeline } from './scoreTimeline';

const PRACTICE_KEYS = majorKeys.filter((k) => k !== 'C#' && k !== 'Gb');

const writtenChordNames = (q: MultiSheetQuestion): Map<number, string> => {
	const names = new Map<number, string>();
	q.voices.forEach((voice) => {
		let beat = 0;
		voice.stack.forEach((s) => {
			if (s.chordName && !names.has(beat)) names.set(beat, s.chordName);
			beat += durationBeats[s.duration];
		});
	});
	return names;
};

const candidateScore = (name: string): number => {
	const [chordName, bass] = name.split('/');
	return chordName.length + (bass ? 0.5 : 0) + (chordName.includes('6') ? 1 : 0);
};

const detectChordName = (events: NoteEvent[], sharps: boolean): string | undefined => {
	const pcs = events.map((e) => Midi.midiToNoteName(e.midi, { pitchClass: true, sharps }));
	const best = Chord.detect(pcs.filter((pc, i) => pcs.indexOf(pc) === i)).sort(
		(a, b) => candidateScore(a) - candidateScore(b),
	)[0];
	return best?.split('/')[0].replace(/M$/, '');
};

export function progressionChordNames(q: MultiSheetQuestion): string[] {
	const timeline = buildScoreTimeline(q);
	const written = writtenChordNames(q);
	const sharps = Key.majorKey(q.key).alteration > 0;
	const names = timeline.beats.map(
		(beat, i) => written.get(beat) ?? detectChordName(activeNotesAt(timeline, i), sharps),
	);
	return names.filter((n, i): n is string => !!n && n !== names[i - 1]);
}

const romanNumeralPrompt = (key: string, numerals: string[]): string =>
	`**Key of ${prettyChordSymbol(key)}**\n\n${numerals.join(' – ')}`;

export function romanNumeralDeckCards(q: MultiSheetQuestion) {
	const chordNames = progressionChordNames(q);
	if (!chordNames.length) return null;
	const numerals = chordNames.map((c) =>
		prettyChordSymbol(chordNameToRomanNumeral(q.key, c) ?? c),
	);
	const answers: ChordMemoryAnswer[] = PRACTICE_KEYS.map((key) => {
		const interval = Interval.distance(q.key, key);
		return {
			type: AnswerType.ChordMemory,
			chords: chordNames.map((c) => getDefaultChordMemoryChord(Chord.transpose(c, interval))),
			key,
			notation: 'romanNumerals',
		};
	});
	const questions = PRACTICE_KEYS.map((key) =>
		chordMemoryQuestion(romanNumeralPrompt(key, numerals), key),
	);
	return { questions, answers };
}

export const romanNumeralSource = (card: Card): MultiSheetQuestion | null =>
	card.type === CardTypeEnum.MultiSheet &&
	card.answer.type !== AnswerType.ChordMemory &&
	progressionChordNames(card.question).length
		? card.question
		: null;

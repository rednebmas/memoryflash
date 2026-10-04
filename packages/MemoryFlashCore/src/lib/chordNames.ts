import { Chord, Key, Midi } from 'tonal';
import { MultiSheetQuestion, StackedNotes } from '../types/MultiSheetCard';
import { durationBeats } from './measure';
import { chordNameToRomanNumeral, prettyChordSymbol } from './romanNumerals';
import { NoteEvent, activeNotesAt, buildScoreTimeline } from './scoreTimeline';

export type ChordSlot = {
	voice: number;
	index: number;
	beat: number;
	written?: string;
	notes: string[];
	detected?: string;
};

export type ChordNames = (string | undefined)[];

const startsChord = (s: StackedNotes) =>
	!s.rest && s.notes.some((_, i) => !s.tie?.fromPrevious?.includes(i));

type ChordStart = Omit<ChordSlot, 'notes' | 'detected'>;

const chordStarts = (q: MultiSheetQuestion): ChordStart[] =>
	q.voices.flatMap((v, voice) => {
		let beat = 0;
		return v.stack.flatMap((s, index) => {
			const start = beat;
			beat += durationBeats[s.duration];
			return startsChord(s) ? [{ voice, index, beat: start, written: s.chordName }] : [];
		});
	});

const candidateScore = (name: string): number => {
	const [chordName, bass] = name.split('/');
	return chordName.length + (bass ? 0.5 : 0) + (chordName.includes('6') ? 1 : 0);
};

const pitchClasses = (events: NoteEvent[], sharps: boolean): string[] => {
	const pcs = events.map((e) => Midi.midiToNoteName(e.midi, { pitchClass: true, sharps }));
	return pcs.filter((pc, i) => pcs.indexOf(pc) === i);
};

const detectChordName = (pcs: string[]): string | undefined => {
	const best = Chord.detect(pcs).sort((a, b) => candidateScore(a) - candidateScore(b))[0];
	return best?.split('/')[0].replace(/M$/, '');
};

export function chordSlots(q: MultiSheetQuestion): ChordSlot[] {
	const timeline = buildScoreTimeline(q);
	const sharps = Key.majorKey(q.key).alteration > 0;
	const starts = chordStarts(q).sort((a, b) => a.beat - b.beat || a.voice - b.voice);
	return starts
		.filter((s, i) => s.beat !== starts[i - 1]?.beat)
		.map((s) => {
			const notes = pitchClasses(
				activeNotesAt(timeline, timeline.beats.indexOf(s.beat)),
				sharps,
			);
			return { ...s, notes, detected: detectChordName(notes) };
		})
		.filter((s) => s.notes.length > 1);
}

export const writtenChordNames = (q: MultiSheetQuestion): ChordNames =>
	chordSlots(q).map((s) => s.written);

export function withChordNames(q: MultiSheetQuestion, names: ChordNames): MultiSheetQuestion {
	const named = new Map(chordSlots(q).map((s, i) => [`${s.voice}:${s.index}`, names[i]?.trim()]));
	return {
		...q,
		voices: q.voices.map((v, voice) => ({
			...v,
			stack: v.stack.map((s, index) => {
				const key = `${voice}:${index}`;
				if (!named.has(key)) return s;
				const { chordName: _, ...rest } = s;
				const chordName = named.get(key);
				return chordName ? { ...rest, chordName } : rest;
			}),
		})),
	};
}

export function progressionChordNames(q: MultiSheetQuestion): string[] {
	const names = chordSlots(q).map((s) => s.written || s.detected);
	return names.filter((n, i): n is string => !!n && n !== names[i - 1]);
}

export function romanNumeralPrompt(q: MultiSheetQuestion): string {
	const numerals = progressionChordNames(q).map((c) =>
		prettyChordSymbol(chordNameToRomanNumeral(q.key, c) ?? c),
	);
	return `**Key of ${prettyChordSymbol(q.key)}**\n\n${numerals.join(' – ')}`;
}

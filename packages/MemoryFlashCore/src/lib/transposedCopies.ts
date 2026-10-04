import { Interval, Note } from 'tonal';
import { AnswerType, Card, CardTypeEnum } from '../types/Cards';
import { MultiSheetQuestion, SheetNote, StackedNotes } from '../types/MultiSheetCard';
import { SHEET_DISPLAY_MODES } from '../types/PresentationMode';
import { withChordNames, writtenChordNames } from './chordNames';
import { transposeChordName } from './multiKeyTransposer';

export type CardUpdate = { id: string; question: MultiSheetQuestion };

const tieKey = (s: StackedNotes) => `${s.tie?.toNext ?? []}|${s.tie?.fromPrevious ?? []}`;

const sameShape = (a: StackedNotes, b: StackedNotes) =>
	a.duration === b.duration &&
	!!a.rest === !!b.rest &&
	a.notes.length === b.notes.length &&
	tieKey(a) === tieKey(b);

const midi = (n: SheetNote) => Note.midi(n.name + n.octave) ?? NaN;

const midiOffsets = (from: MultiSheetQuestion, to: MultiSheetQuestion): number[] | null => {
	const offsets: number[] = [];
	const matches =
		from.voices.length === to.voices.length &&
		from.voices.every((voice, v) => {
			const other = to.voices[v];
			if (voice.staff !== other.staff || voice.stack.length !== other.stack.length)
				return false;
			return voice.stack.every((s, i) => {
				if (!sameShape(s, other.stack[i])) return false;
				s.notes.forEach((n, j) => offsets.push(midi(other.stack[i].notes[j]) - midi(n)));
				return true;
			});
		});
	return matches ? offsets : null;
};

export function transpositionInterval(
	from: MultiSheetQuestion,
	to: MultiSheetQuestion,
): string | null {
	const offsets = midiOffsets(from, to);
	if (!offsets?.length || offsets.some((o) => o !== offsets[0])) return null;
	const interval = Interval.distance(from.key, to.key);
	const semitones = Interval.semitones(interval) ?? NaN;
	return (((offsets[0] - semitones) % 12) + 12) % 12 === 0 ? interval : null;
}

type SheetCard = Extract<Card, { type: CardTypeEnum.MultiSheet }>;

const isSheetCard = (c: Card): c is SheetCard =>
	c.type === CardTypeEnum.MultiSheet && c.answer.type !== AnswerType.ChordMemory;

export const transposedCopies = (
	cards: Card[],
	source: Card,
	question: MultiSheetQuestion,
): SheetCard[] =>
	isSheetCard(source)
		? cards.filter(
				(c): c is SheetCard =>
					c._id !== source._id &&
					c.deckId === source.deckId &&
					isSheetCard(c) &&
					!!transpositionInterval(question, c.question),
			)
		: [];

export const transposedCopyKeys = (cards: Card[], source: Card): string[] =>
	isSheetCard(source)
		? transposedCopies(cards, source, source.question)
				.map((c) => c.question.key)
				.filter((key, i, keys) => key !== source.question.key && keys.indexOf(key) === i)
		: [];

const syncedModes = (after: MultiSheetQuestion, copy: MultiSheetQuestion) => {
	const synced = (q: MultiSheetQuestion) =>
		(q.presentationModes ?? []).every((m) => SHEET_DISPLAY_MODES.some((id) => id === m.id));
	return synced(after) && synced(copy) ? after.presentationModes : copy.presentationModes;
};

export function syncedCopy(
	before: MultiSheetQuestion,
	after: MultiSheetQuestion,
	copy: MultiSheetQuestion,
): MultiSheetQuestion | null {
	const interval = transpositionInterval(after, copy);
	if (!interval || !transpositionInterval(before, after)) return null;
	const old = writtenChordNames(before);
	const current = writtenChordNames(copy);
	const names = writtenChordNames(after).map((name, i) => {
		const propagated = old[i] && transposeChordName(old[i], interval);
		const keep = current[i] !== undefined && current[i] !== propagated;
		return keep ? current[i] : name && transposeChordName(name, interval);
	});
	const next = { ...withChordNames(copy, names), presentationModes: syncedModes(after, copy) };
	return JSON.stringify(next) === JSON.stringify(copy) ? null : next;
}

export const transposedCopyUpdates = (
	cards: Card[],
	source: Card,
	after: MultiSheetQuestion,
): CardUpdate[] =>
	transposedCopies(cards, source, after).flatMap((c) => {
		const question = isSheetCard(source) && syncedCopy(source.question, after, c.question);
		return question ? [{ id: c._id, question }] : [];
	});

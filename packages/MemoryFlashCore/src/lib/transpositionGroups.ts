import ObjectId from 'bson-objectid';
import { Interval, Note } from 'tonal';
import { Card, CardTypeEnum } from '../types/Cards';
import { MultiSheetQuestion, SheetNote, StackedNotes } from '../types/MultiSheetCard';

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

export type SheetCard = Extract<Card, { type: CardTypeEnum.MultiSheet }>;

type Clusterable = { deckId: string; question: MultiSheetQuestion };

export const newGroupId = () => ObjectId().toHexString();

export function transpositionClusters<C extends Clusterable>(cards: C[]): C[][] {
	const byDeck = new Map<string, C[][]>();
	cards.forEach((card) => {
		const clusters = byDeck.get(card.deckId) ?? [];
		const home = clusters.find(([first]) =>
			transpositionInterval(first.question, card.question),
		);
		if (home) home.push(card);
		else byDeck.set(card.deckId, [...clusters, [card]]);
	});
	return Array.from(byDeck.values())
		.flat()
		.filter((c) => c.length > 1);
}

export const groupMembers = (cards: Card[], source: SheetCard): SheetCard[] =>
	source.transpositionGroup
		? cards.filter(
				(c): c is SheetCard =>
					c.type === CardTypeEnum.MultiSheet &&
					c.deckId === source.deckId &&
					c.transpositionGroup === source.transpositionGroup,
			)
		: [source];

export const groupKeys = (cards: Card[], hiddenIds: string[], source: SheetCard): string[] =>
	groupMembers(cards, source)
		.filter((c) => c._id === source._id || !hiddenIds.includes(c._id))
		.map((c) => c.question.key)
		.filter((key, i, keys) => keys.indexOf(key) === i);

export type GroupSave = {
	updates: { id: string; question: MultiSheetQuestion }[];
	add: MultiSheetQuestion[];
	hide: string[];
	unhide: string[];
};
export const hiddenAfter = (hiddenIds: string[], { hide, unhide }: GroupSave) => [
	...hiddenIds.filter((id) => !unhide.includes(id)),
	...hide,
];

const cardPerKey = (
	members: SheetCard[],
	hiddenIds: Set<string>,
	source: SheetCard,
	sourceKey: string,
) => {
	const hidden = (c: SheetCard) => Number(hiddenIds.has(c._id));
	const others = members.filter((c) => c._id !== source._id);
	const byKey = new Map<string, SheetCard>([[sourceKey, source]]);
	others
		.sort((a, b) => hidden(a) - hidden(b))
		.forEach((c) => {
			if (!byKey.has(c.question.key)) byKey.set(c.question.key, c);
		});
	return byKey;
};

export function planGroupSave(
	members: SheetCard[],
	hiddenIds: string[],
	source: SheetCard,
	previews: MultiSheetQuestion[],
	sourceKey = source.question.key,
): GroupSave {
	const hidden = new Set(hiddenIds);
	const byKey = cardPerKey(members, hidden, source, sourceKey);
	const kept = (c: SheetCard) =>
		c._id === source._id ||
		(byKey.get(c.question.key) === c && previews.some((q) => q.key === c.question.key));
	const ids = (cards: SheetCard[]) => cards.map((c) => c._id);
	return {
		updates: previews.flatMap((q) => {
			const card = byKey.get(q.key);
			return card ? [{ id: card._id, question: q }] : [];
		}),
		add: previews.filter((q) => !byKey.has(q.key)),
		hide: ids(members.filter((c) => !kept(c) && !hidden.has(c._id))),
		unhide: ids(members.filter((c) => kept(c) && hidden.has(c._id))),
	};
}

export function linkAcrossKeys(rows: MultiSheetQuestion[][], newId = newGroupId) {
	const questions: MultiSheetQuestion[] = [];
	const groups: (string | undefined)[] = [];
	(rows[0] ?? []).forEach((_, j) => {
		const group = rows.length > 1 ? newId() : undefined;
		rows.forEach((row) => {
			questions.push(row[j]);
			groups.push(group);
		});
	});
	return { questions, groups };
}

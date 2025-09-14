import { Note } from 'tonal';
import { MultiSheetCard } from 'MemoryFlashCore/src/types/MultiSheetCard';

export interface ChordState {
	startNotes: number[];
	carryNotes: number[];
	releaseNotes: number[];
}

const DURATION_TICKS: Record<string, number> = { '16': 1, '8': 2, q: 4, h: 8, w: 16 };

const parseDuration = (d: string) => {
	const dotted = d.endsWith('d');
	const base = DURATION_TICKS[dotted ? d.slice(0, -1) : d] ?? 0;
	return dotted ? (base * 3) / 2 : base;
};

const collectEvents = (card: MultiSheetCard) => {
	const events: Record<number, { start: number[]; end: number[] }> = {};
	card.question.voices.forEach((voice) => {
		let tick = 0;
		voice.stack.forEach((st) => {
			const dur = parseDuration(st.duration);
			if (st.notes?.length && !st.rest) {
				const mids = st.notes
					.map((n) => Note.midi(n.name + n.octave))
					.filter((n): n is number => typeof n === 'number');
				events[tick] ??= { start: [], end: [] };
				events[tick].start.push(...mids);
				events[tick + dur] ??= { start: [], end: [] };
				events[tick + dur].end.push(...mids);
			}
			tick += dur;
		});
	});
	return events;
};

const eventsToTimeline = (
	events: Record<number, { start: number[]; end: number[] }>,
): ChordState[] => {
	const ticks = Object.keys(events)
		.map(Number)
		.sort((a, b) => a - b);
	const timeline: ChordState[] = [];
	let held: number[] = [];
	ticks.forEach((t) => {
		const ev = events[t];
		held = held.filter((n) => !ev.end.includes(n));
		const carry = [...held].sort((a, b) => a - b);
		const start = ev.start.slice().sort((a, b) => a - b);
		timeline.push({
			startNotes: start,
			carryNotes: carry,
			releaseNotes: ev.end.slice().sort((a, b) => a - b),
		});
		held = [...carry, ...start].sort((a, b) => a - b);
	});
	return timeline;
};

export const buildNoteTimeline = (card: MultiSheetCard) => eventsToTimeline(collectEvents(card));

import { Midi, Note } from 'tonal';
import { MultiSheetQuestion, NoteDuration, StackedNotes, SheetNote } from '../types/MultiSheetCard';
import { StaffEnum } from '../types/Cards';
import { createRestDurations, durationBeats, insertRestsToFillBars } from './measure';

interface TimedNotes {
	start: number;
	notes: { name: string; octave: number }[];
	duration: NoteDuration;
}

interface StaffState {
	events: TimedNotes[];
	beats: number;
	duration: NoteDuration;
}

type StaffKey = StaffEnum.Treble | StaffEnum.Bass;

export class MusicRecorder {
	public notes: StackedNotes[] = [];
	public splitNote: string;

	private _maxBeats = 4;
	private bars = 1;
	private prevMidiNotes: number[] = [];
	private currentBeat = 0;
	private pendingChord: {
		start: number;
		treble: number[];
		bass: number[];
	} | null = null;
	private staff: Record<StaffKey, StaffState>;

	constructor(
		trebleDuration: NoteDuration = 'q',
		splitNote = 'C4',
		bassDuration: NoteDuration = 'q',
		bars = 1,
	) {
		this.splitNote = splitNote;
		this.setBars(bars);
		this.staff = {
			[StaffEnum.Treble]: { events: [], beats: 0, duration: trebleDuration },
			[StaffEnum.Bass]: { events: [], beats: 0, duration: bassDuration },
		};
	}

	setBars(bars: number): void {
		this.bars = bars;
		this._maxBeats = bars * 4;
	}

	updateDuration(dur: NoteDuration, staff?: StaffEnum): void {
		if (staff === undefined) {
			this.staff[StaffEnum.Treble].duration = dur;
			this.staff[StaffEnum.Bass].duration = dur;
		} else {
			this.staff[staff as StaffKey].duration = dur;
		}
	}

	private toSheet(nums: number[]): SheetNote[] {
		return nums.map((m) => {
			const name = Midi.midiToNoteName(m);
			const match = name.match(/([A-G][#b]?(?:bb|##)?)(\d+)/)!;
			return { name: match[1], octave: parseInt(match[2]) };
		});
	}

	private addEvent(staff: StaffEnum, midi: number[], start: number) {
		const state = this.staff[staff as StaffKey];
		const beats = durationBeats[state.duration];
		if (state.beats + beats > this._maxBeats) return false;
		state.events.push({ start, notes: this.toSheet(midi), duration: state.duration });
		state.beats = start + beats;
		return true;
	}

	private appendNotes(staff: StaffEnum, midi: number[]) {
		const state = this.staff[staff as StaffKey];
		if (!state.events.length) return;
		const event = state.events[state.events.length - 1];
		const existing = new Set(event.notes.map((n) => `${n.name}${n.octave}`));
		for (const n of this.toSheet(midi)) {
			if (!existing.has(`${n.name}${n.octave}`)) event.notes.push(n);
		}
	}

	private rebuildNotes() {
		const all = [...this.staff[StaffEnum.Treble].events, ...this.staff[StaffEnum.Bass].events];
		all.sort((a, b) => a.start - b.start);
		const merged: { start: number; notes: SheetNote[]; duration: NoteDuration }[] = [];
		for (const e of all) {
			const last = merged[merged.length - 1];
			if (last && last.start === e.start && last.duration === e.duration) {
				const existing = new Set(last.notes.map((n) => `${n.name}${n.octave}`));
				for (const n of e.notes) {
					if (!existing.has(`${n.name}${n.octave}`)) last.notes.push(n);
				}
			} else {
				merged.push({ start: e.start, notes: [...e.notes], duration: e.duration });
			}
		}
		this.notes = merged.map((e) => ({ notes: e.notes, duration: e.duration }));
	}

	addMidiNotes(midiNotes: number[]): void {
		const wasHolding = this.prevMidiNotes.length > 0;
		const isHolding = midiNotes.length > 0;
		const added = midiNotes.filter((m) => !this.prevMidiNotes.includes(m));

		const splitMidi = Note.midi(this.splitNote)!;
		const isTreble = (m: number) => m >= splitMidi;

		if (isHolding && !this.pendingChord) {
			this.pendingChord = { start: this.currentBeat, treble: [], bass: [] };
			const treble = midiNotes.filter(isTreble);
			const bass = midiNotes.filter((m) => !isTreble(m));
			this.pendingChord.treble.push(...treble);
			this.pendingChord.bass.push(...bass);
		} else if (this.pendingChord && added.length) {
			this.pendingChord.treble.push(...added.filter(isTreble));
			this.pendingChord.bass.push(...added.filter((m) => !isTreble(m)));
		}

		if (wasHolding && !isHolding && this.pendingChord) {
			const start = this.pendingChord.start;
			let recorded = false;
			if (this.pendingChord.treble.length)
				recorded =
					this.addEvent(StaffEnum.Treble, this.pendingChord.treble, start) || recorded;
			if (this.pendingChord.bass.length)
				recorded = this.addEvent(StaffEnum.Bass, this.pendingChord.bass, start) || recorded;
			if (recorded) {
				this.rebuildNotes();
				this.currentBeat = Math.max(
					this.staff[StaffEnum.Treble].beats,
					this.staff[StaffEnum.Bass].beats,
				);
			}
			this.pendingChord = null;
		}

		this.prevMidiNotes = midiNotes;
	}

	reset(): void {
		this.staff[StaffEnum.Treble] = {
			events: [],
			beats: 0,
			duration: this.staff[StaffEnum.Treble].duration,
		};
		this.staff[StaffEnum.Bass] = {
			events: [],
			beats: 0,
			duration: this.staff[StaffEnum.Bass].duration,
		};
		this.notes = [];
		this.prevMidiNotes = [];
		this.pendingChord = null;
		this.currentBeat = 0;
	}

	get filledNotes(): StackedNotes[] {
		return this.notes.length
			? insertRestsToFillBars(this.notes)
			: [{ notes: [], duration: 'w', rest: true }];
	}

	private buildStack(events: TimedNotes[]): StackedNotes[] {
		let beat = 0;
		const stack: StackedNotes[] = [];
		for (const e of events) {
			if (e.start > beat) {
				stack.push(...createRestDurations(e.start - beat));
				beat = e.start;
			}
			stack.push({ notes: e.notes, duration: e.duration });
			beat = e.start + durationBeats[e.duration];
		}
		return insertRestsToFillBars(stack);
	}

	buildQuestion(key: string): MultiSheetQuestion {
		if (
			!this.staff[StaffEnum.Treble].events.length &&
			!this.staff[StaffEnum.Bass].events.length
		) {
			return {
				key,
				voices: [
					{ staff: StaffEnum.Treble, stack: [{ notes: [], duration: 'w', rest: true }] },
				],
			};
		}

		const voices = [] as { staff: StaffEnum; stack: StackedNotes[] }[];
		if (this.staff[StaffEnum.Treble].events.length) {
			voices.push({
				staff: StaffEnum.Treble,
				stack: this.buildStack(this.staff[StaffEnum.Treble].events),
			});
		}
		if (this.staff[StaffEnum.Bass].events.length) {
			voices.push({
				staff: StaffEnum.Bass,
				stack: this.buildStack(this.staff[StaffEnum.Bass].events),
			});
		}
		return { key, voices };
	}
}

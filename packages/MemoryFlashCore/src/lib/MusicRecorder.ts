import { Midi, Note } from 'tonal';
import { MultiSheetQuestion, NoteDuration, StackedNotes, SheetNote } from '../types/MultiSheetCard';
import { StaffEnum } from '../types/Cards';
import { createRestDurations, durationBeats, insertRestsToFillBars } from './measure';
import { majorKey } from '@tonaljs/key';

interface TimedNotes {
	start: number;
	notes: number[];
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
	private activeStart: number | null = null;
	private activeStaffs: Partial<Record<StaffKey, boolean>> = {};
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

	private toSheetNote(midi: number, key: string): SheetNote {
		const alteration = majorKey(key).alteration;
		const useSharps = alteration > 0;
		const name = Midi.midiToNoteName(midi, { sharps: useSharps });
		const match = name.match(/([A-G][#b]?(?:bb|##)?)(\d+)/)!;
		return { name: match[1], octave: parseInt(match[2]) };
	}

	private addEvent(staff: StaffEnum, midi: number[], start: number) {
		const state = this.staff[staff as StaffKey];
		const beats = durationBeats[state.duration];
		if (state.beats + beats > this._maxBeats) return false;
		state.events.push({ start, notes: [...midi], duration: state.duration });
		state.beats = start + beats;
		return true;
	}

	private appendNotes(staff: StaffEnum, midi: number[]) {
		const state = this.staff[staff as StaffKey];
		if (!state.events.length) return;
		const event = state.events[state.events.length - 1];
		const existing = new Set(event.notes);
		for (const n of midi) {
			if (!existing.has(n)) event.notes.push(n);
		}
	}

	private rebuildNotes() {
		const all = [...this.staff[StaffEnum.Treble].events, ...this.staff[StaffEnum.Bass].events];
		all.sort((a, b) => a.start - b.start);
		const merged: { start: number; notes: number[]; duration: NoteDuration }[] = [];
		for (const e of all) {
			const last = merged[merged.length - 1];
			if (last && last.start === e.start && last.duration === e.duration) {
				const existing = new Set(last.notes);
				for (const n of e.notes) {
					if (!existing.has(n)) last.notes.push(n);
				}
			} else {
				merged.push({ start: e.start, notes: [...e.notes], duration: e.duration });
			}
		}
		this.notes = merged.map((e) => ({
			notes: e.notes.map((m) => this.toSheetNote(m, 'C')),
			duration: e.duration,
		}));
	}

	addMidiNotes(midiNotes: number[]): void {
		const wasHolding = this.prevMidiNotes.length > 0;
		const isHolding = midiNotes.length > 0;
		const added = midiNotes.filter((m) => !this.prevMidiNotes.includes(m));

		const splitMidi = Note.midi(this.splitNote)!;
		const isTreble = (m: number) => m >= splitMidi;
		const trebleAdded = added.filter(isTreble);
		const bassAdded = added.filter((m) => !isTreble(m));

		if (!wasHolding && isHolding) {
			this.activeStart = this.currentBeat;
			this.activeStaffs = {};
			const treble = midiNotes.filter(isTreble);
			const bass = midiNotes.filter((m) => !isTreble(m));
			let recorded = false;
			if (treble.length) {
				recorded = this.addEvent(StaffEnum.Treble, treble, this.activeStart) || recorded;
				this.activeStaffs[StaffEnum.Treble] = true;
			}
			if (bass.length) {
				recorded = this.addEvent(StaffEnum.Bass, bass, this.activeStart) || recorded;
				this.activeStaffs[StaffEnum.Bass] = true;
			}
			if (recorded) this.rebuildNotes();
		} else if (wasHolding && isHolding && added.length) {
			if (trebleAdded.length) {
				if (this.activeStaffs[StaffEnum.Treble]) {
					this.appendNotes(StaffEnum.Treble, trebleAdded);
				} else if (this.activeStart !== null) {
					if (this.addEvent(StaffEnum.Treble, trebleAdded, this.activeStart))
						this.activeStaffs[StaffEnum.Treble] = true;
				}
			}
			if (bassAdded.length) {
				if (this.activeStaffs[StaffEnum.Bass]) {
					this.appendNotes(StaffEnum.Bass, bassAdded);
				} else if (this.activeStart !== null) {
					if (this.addEvent(StaffEnum.Bass, bassAdded, this.activeStart))
						this.activeStaffs[StaffEnum.Bass] = true;
				}
			}
			if (trebleAdded.length || bassAdded.length) this.rebuildNotes();
		} else if (wasHolding && !isHolding) {
			this.currentBeat = Math.max(
				this.staff[StaffEnum.Treble].beats,
				this.staff[StaffEnum.Bass].beats,
			);
			this.activeStart = null;
			this.activeStaffs = {};
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
		this.activeStart = null;
		this.activeStaffs = {};
		this.currentBeat = 0;
	}

	get filledNotes(): StackedNotes[] {
		return this.notes.length
			? insertRestsToFillBars(this.notes)
			: [{ notes: [], duration: 'w', rest: true }];
	}

	private buildStack(events: TimedNotes[], key: string): StackedNotes[] {
		let beat = 0;
		const stack: StackedNotes[] = [];
		for (const e of events) {
			if (e.start > beat) {
				stack.push(...createRestDurations(e.start - beat));
				beat = e.start;
			}
			stack.push({ notes: e.notes.map((m) => this.toSheetNote(m, key)), duration: e.duration });
			beat = e.start + durationBeats[e.duration];
		}
		return insertRestsToFillBars(stack);
	}

	get totalBeatsRecorded(): number {
		return Math.max(this.staff[StaffEnum.Treble].beats, this.staff[StaffEnum.Bass].beats);
	}

	hasFullMeasure(): boolean {
		return this.totalBeatsRecorded >= this._maxBeats;
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
				stack: this.buildStack(this.staff[StaffEnum.Treble].events, key),
			});
		}
		if (this.staff[StaffEnum.Bass].events.length) {
			voices.push({
				staff: StaffEnum.Bass,
				stack: this.buildStack(this.staff[StaffEnum.Bass].events, key),
			});
		}
		return { key, voices };
	}
}

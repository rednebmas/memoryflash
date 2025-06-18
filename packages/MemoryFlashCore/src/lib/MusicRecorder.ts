import { Midi, Note } from 'tonal';
import {
	MultiSheetQuestion,
	StackedNotes,
	NoteDuration,
	Voice,
	SheetNote,
} from '../types/MultiSheetCard';
import { StaffEnum } from '../types/Cards';
import { createRestDurations, durationBeats } from './measure';

type TimedNotes = StackedNotes & { start: number };

export class MusicRecorder {
	private _maxBeats = 4;
	private prevMidiNotes: number[] = [];
	private cursors: Record<StaffEnum.Treble | StaffEnum.Bass, number> = {
		[StaffEnum.Treble]: 0,
		[StaffEnum.Bass]: 0,
	};
	private current: Partial<Record<StaffEnum.Treble | StaffEnum.Bass, TimedNotes>> = {};
	private events: Record<StaffEnum.Treble | StaffEnum.Bass, TimedNotes[]> = {
		[StaffEnum.Treble]: [],
		[StaffEnum.Bass]: [],
	};

	constructor(
		public trebleDuration: NoteDuration = 'q',
		public bassDuration: NoteDuration = 'q',
		public splitNote = 'C4',
	) {}

	updateDuration(dur: NoteDuration, staff: StaffEnum.Treble | StaffEnum.Bass) {
		if (staff === StaffEnum.Treble) this.trebleDuration = dur;
		if (staff === StaffEnum.Bass) this.bassDuration = dur;
	}

	addRest(staff: StaffEnum.Treble | StaffEnum.Bass): void {
		const dur = this.getDuration(staff);
		const beats = durationBeats[dur];
		if (this.cursors[staff] + beats > this._maxBeats) return;
		const rest: TimedNotes = {
			notes: [],
			duration: dur,
			rest: true,
			start: this.cursors[staff],
		};
		this.events[staff].push(rest);
		this.cursors[staff] += beats;
	}

	private getDuration(staff: StaffEnum.Treble | StaffEnum.Bass): NoteDuration {
		return staff === StaffEnum.Treble ? this.trebleDuration : this.bassDuration;
	}

	private toSheet(nums: number[]): SheetNote[] {
		return nums.map((m) => {
			const name = Midi.midiToNoteName(m);
			const match = name.match(/([A-G][#b]?)(\d+)/)!;
			return { name: match[1], octave: parseInt(match[2]) };
		});
	}

	addMidiNotes(midiNotes: number[]): void {
		const wasHolding = this.prevMidiNotes.length > 0;
		const isHolding = midiNotes.length > 0;
		const added = midiNotes.filter((m) => !this.prevMidiNotes.includes(m));

		const splitMidi = Note.midi(this.splitNote)!;
		const trebleMidi = midiNotes.filter((m) => m >= splitMidi);
		const bassMidi = midiNotes.filter((m) => m < splitMidi);

		if (!wasHolding && isHolding) {
			if (trebleMidi.length) this.startEvent(StaffEnum.Treble, trebleMidi);
			if (bassMidi.length) this.startEvent(StaffEnum.Bass, bassMidi);
		} else if (wasHolding && isHolding && added.length) {
			const addedTreble = added.filter((n) => n >= splitMidi);
			const addedBass = added.filter((n) => n < splitMidi);
			if (addedTreble.length && this.current[StaffEnum.Treble]) {
				const existing = new Set(
					this.current[StaffEnum.Treble]!.notes.map((n) => `${n.name}${n.octave}`),
				);
				for (const n of this.toSheet(addedTreble)) {
					if (!existing.has(`${n.name}${n.octave}`))
						this.current[StaffEnum.Treble]!.notes.push(n);
				}
			}
			if (addedBass.length && this.current[StaffEnum.Bass]) {
				const existing = new Set(
					this.current[StaffEnum.Bass]!.notes.map((n) => `${n.name}${n.octave}`),
				);
				for (const n of this.toSheet(addedBass)) {
					if (!existing.has(`${n.name}${n.octave}`))
						this.current[StaffEnum.Bass]!.notes.push(n);
				}
			}
		} else if (wasHolding && !isHolding) {
			this.current = {};
		}

		this.prevMidiNotes = midiNotes;
	}

	private startEvent(staff: StaffEnum.Treble | StaffEnum.Bass, midi: number[]): void {
		const dur = this.getDuration(staff);
		const beats = durationBeats[dur];
		if (this.cursors[staff] + beats > this._maxBeats) return;
		const event: TimedNotes = {
			notes: this.toSheet(midi),
			duration: dur,
			start: this.cursors[staff],
		};
		this.events[staff].push(event);
		this.current[staff] = event;
		this.cursors[staff] += beats;
	}

	removeLast(): void {
		const staffs: (StaffEnum.Treble | StaffEnum.Bass)[] = [StaffEnum.Treble, StaffEnum.Bass];
		let last: { staff: StaffEnum.Treble | StaffEnum.Bass; event: TimedNotes } | null = null;
		for (const staff of staffs) {
			const ev = this.events[staff].at(-1);
			if (!ev) continue;
			if (!last || ev.start > last.event.start) {
				last = { staff, event: ev };
			}
		}
		if (last) {
			this.events[last.staff].pop();
			this.cursors[last.staff] -= durationBeats[last.event.duration];
		}
	}

	reset(): void {
		this.events[StaffEnum.Treble] = [];
		this.events[StaffEnum.Bass] = [];
		this.cursors[StaffEnum.Treble] = 0;
		this.cursors[StaffEnum.Bass] = 0;
		this.current = {};
		this.prevMidiNotes = [];
	}

	private buildVoice(staff: StaffEnum.Treble | StaffEnum.Bass): Voice | null {
		const evs = this.events[staff];
		if (!evs.length) return null;
		const stack: StackedNotes[] = [];
		let time = 0;
		for (const ev of evs) {
			if (ev.start > time) {
				stack.push(...createRestDurations(ev.start - time));
				time = ev.start;
			}
			stack.push({ notes: ev.notes, duration: ev.duration, rest: ev.rest });
			time += durationBeats[ev.duration];
		}
		if (time < this._maxBeats) stack.push(...createRestDurations(this._maxBeats - time));
		return { staff, stack };
	}

	buildQuestion(key: string): MultiSheetQuestion {
		const voices: Voice[] = [];
		const treble = this.buildVoice(StaffEnum.Treble);
		const bass = this.buildVoice(StaffEnum.Bass);
		if (treble) voices.push(treble);
		if (bass) voices.push(bass);
		if (!voices.length) {
			voices.push({
				staff: StaffEnum.Treble,
				stack: createRestDurations(4),
			});
		}
		return { key, voices };
	}
}

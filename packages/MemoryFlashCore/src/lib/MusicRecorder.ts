import { Midi } from 'tonal';
import { MultiSheetQuestion, StackedNotes, NoteDuration } from '../types/MultiSheetCard';
import { StaffEnum } from '../types/Cards';
import { buildMultiSheetQuestion } from './notationBuilder';
import { durationBeats, insertRestsToFillBars } from './measure';

export class MusicRecorder {
	public notes: StackedNotes[] = [];
	private _maxBeats = 4;
	private prevMidiNotes: number[] = [];

	constructor(public duration: NoteDuration = 'q') {}

	updateDuration(dur: NoteDuration) {
		this.duration = dur;
	}

	addMidiNotes(midiNotes: number[]): void {
		// Do we have max beats?
		const beatsSoFar = this.notes.reduce((sum, n) => sum + durationBeats[n.duration], 0);
		const beats = durationBeats[this.duration];
		if (beatsSoFar + beats > this._maxBeats) {
			this.prevMidiNotes = midiNotes;
			return;
		}

		const wasHolding = this.prevMidiNotes.length > 0;
		const isHolding = midiNotes.length > 0;
		const added = midiNotes.filter((m) => !this.prevMidiNotes.includes(m));

		const toSheet = (nums: number[]) =>
			nums.map((m) => {
				const name = Midi.midiToNoteName(m);
				const match = name.match(/([A-G][#b]?)(\d+)/)!;
				return { name: match[1], octave: parseInt(match[2]) };
			});

		if (!wasHolding && isHolding) {
			this.notes.push({ notes: toSheet(midiNotes), duration: this.duration });
		} else if (wasHolding && isHolding && added.length && this.notes.length) {
			const current = this.notes[this.notes.length - 1];
			const existing = new Set(current.notes.map((n) => `${n.name}${n.octave}`));
			for (const n of toSheet(added)) {
				if (!existing.has(`${n.name}${n.octave}`)) current.notes.push(n);
			}
		}

		this.prevMidiNotes = midiNotes;
	}

	removeLast(): void {
		this.notes.pop();
	}

	reset(): void {
		this.notes = [];
	}

	get filledNotes(): StackedNotes[] {
		return this.notes.length
			? insertRestsToFillBars(this.notes)
			: [{ notes: [], duration: 'w', rest: true }];
	}

	buildQuestion(key: string): MultiSheetQuestion {
		// No recorded notes: default to single whole rest on treble
		if (this.notes.length === 0) {
			return {
				key,
				voices: [
					{ staff: StaffEnum.Treble, stack: [{ notes: [], duration: 'w', rest: true }] },
				],
			};
		}

		// Split notes by staff, then fill rests per voice separately
		const { voices } = buildMultiSheetQuestion(this.notes, key);
		const filledVoices = voices.map((v) => ({
			...v,
			stack: insertRestsToFillBars(v.stack),
		}));
		return { key, voices: filledVoices };
	}
}

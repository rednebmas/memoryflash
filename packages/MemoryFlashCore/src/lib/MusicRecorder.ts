import { Midi } from 'tonal';
import { MultiSheetQuestion, StackedNotes, NoteDuration } from '../types/MultiSheetCard';
import { StaffEnum } from '../types/Cards';
import { insertRestsToFillBars, durationBeats } from './measure';
import { buildMultiSheetQuestion } from './notationBuilder';

export class MusicRecorder {
	public notes: StackedNotes[] = [];
	private prevMidiNotes: number[] = [];
	private beatsPerBar = 4;

	constructor(public duration: NoteDuration = 'q') {}

	updateDuration(dur: NoteDuration) {
		this.duration = dur;
	}

	addMidiNotes(midiNotes: number[]): void {
		const added = midiNotes.filter((m) => !this.prevMidiNotes.includes(m));
		if (added.length) {
			const beatsSoFar = this.notes.reduce((sum, n) => sum + durationBeats[n.duration], 0);
			const beats = durationBeats[this.duration];
			if (beatsSoFar + beats > this.beatsPerBar) {
				this.prevMidiNotes = midiNotes;
				return;
			}
			const sheetNotes = added.map((m) => {
				const name = Midi.midiToNoteName(m);
				const match = name.match(/([A-G][#b]?)(\d+)/)!;
				return { name: match[1], octave: parseInt(match[2]) };
			});
			this.notes.push({ notes: sheetNotes, duration: this.duration });
		}
		this.prevMidiNotes = midiNotes;
	}

	removeLast(): void {
		this.notes.pop();
	}

	reset(): void {
		this.notes = [];
		this.prevMidiNotes = [];
	}

	get filledNotes(): StackedNotes[] {
		return this.notes.length
			? insertRestsToFillBars(this.notes)
			: [{ notes: [], duration: 'w', rest: true }];
	}

	buildQuestion(key: string): MultiSheetQuestion {
		const filled = this.filledNotes;
		return this.notes.length
			? buildMultiSheetQuestion(filled, key)
			: { key, voices: [{ staff: StaffEnum.Treble, stack: filled }] };
	}
}

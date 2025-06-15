import { Midi } from 'tonal';
import { MultiSheetQuestion, StackedNotes } from '../types/MultiSheetCard';
import { StaffEnum } from '../types/Cards';
import { insertRestsToFillBars } from './measure';
import { buildMultiSheetQuestion } from './notationBuilder';

export class MusicRecorder {
	public notes: StackedNotes[] = [];
	private prevMidiNotes: number[] = [];

	constructor(public duration: StackedNotes['duration'] = 'q') {}

	updateDuration(dur: StackedNotes['duration']) {
		this.duration = dur;
	}

	addMidiNotes(midiNotes: number[]): void {
		const added = midiNotes.filter((m) => !this.prevMidiNotes.includes(m));
		if (added.length) {
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

import { MidiNote } from '../redux/slices/midiSlice';
import { AppDispatch } from '../redux/store';

export interface HandleArgs {
	notes: MidiNote[];
	waitingNotes: MidiNote[];
	waiting: boolean;
	index: number;
	dispatch: AppDispatch;
}

type TrackArgs = Pick<HandleArgs, 'notes' | 'waitingNotes' | 'waiting'>;

/**
 * While waiting for held notes to be released, only those held notes count as "previous",
 * so a chord pressed before the last one is released still registers once waiting clears.
 */
export class AddedNotesTracker {
	private prev: number[] = [];

	next({ notes, waitingNotes, waiting }: TrackArgs): number[] {
		const onNotes = notes.map((n) => n.number);
		const added = onNotes.filter((n) => !this.prev.includes(n));
		const held = waitingNotes.map((n) => n.number);
		this.prev = waiting ? onNotes.filter((n) => held.includes(n)) : onNotes;
		return added;
	}
}

export const toMidiNotes = (numbers: number[], time = 0): MidiNote[] =>
	numbers.map((number) => ({ number, time }));

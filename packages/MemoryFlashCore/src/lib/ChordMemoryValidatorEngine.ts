import { Midi, Note } from 'tonal';
import { midiActions } from '../redux/slices/midiSlice';
import { schedulerActions } from '../redux/slices/schedulerSlice';
import { recordAttempt } from '../redux/actions/record-attempt-action';
import { AppDispatch } from '../redux/store';
import { ChordMemoryChord } from '../types/Cards';

interface HandleArgs {
	onNotes: number[];
	waiting: boolean;
	index: number;
	dispatch: AppDispatch;
}

export interface ChordMemoryResult {
	isCorrect: boolean;
	isIncomplete: boolean;
	wrongNotes: number[];
}

export class ChordMemoryValidatorEngine {
	private prev: number[] = [];

	constructor(private chords: ChordMemoryChord[]) {}

	handle({ onNotes, waiting, index, dispatch }: HandleArgs): void {
		const added = this.computeAdded(onNotes);
		this.prev = onNotes;
		if (waiting || added.length === 0) return;

		const chord = this.chords[index];
		if (!chord) return;

		const result = this.validate(onNotes, chord);

		if (result.isCorrect) {
			this.onCorrect(index, dispatch);
		} else if (result.wrongNotes.length > 0) {
			this.onWrong(result.wrongNotes[0], dispatch);
		}
	}

	validate(onNotes: number[], chord: ChordMemoryChord): ChordMemoryResult {
		const playedChromas = onNotes.map((n) => Note.chroma(Midi.midiToNoteName(n)));
		const requiredChromas = chord.requiredTones.map((t) => Note.chroma(t));
		const optionalChromas = chord.optionalTones.map((t) => Note.chroma(t));
		const allowedChromas = new Set([...requiredChromas, ...optionalChromas]);

		const wrongNotes: number[] = [];
		for (let i = 0; i < onNotes.length; i++) {
			const chroma = playedChromas[i];
			if (typeof chroma === 'number' && !allowedChromas.has(chroma)) {
				wrongNotes.push(onNotes[i]);
			}
		}

		if (wrongNotes.length > 0) {
			return { isCorrect: false, isIncomplete: false, wrongNotes };
		}

		const playedChromaSet = new Set(playedChromas.filter((c) => c !== null));
		const hasAllRequired = requiredChromas.every(
			(c) => typeof c === 'number' && playedChromaSet.has(c),
		);

		if (hasAllRequired) {
			return { isCorrect: true, isIncomplete: false, wrongNotes: [] };
		}

		return { isCorrect: false, isIncomplete: true, wrongNotes: [] };
	}

	private computeAdded(onNotes: number[]): number[] {
		return onNotes.filter((n) => !this.prev.includes(n));
	}

	private onWrong(wrongNote: number, dispatch: AppDispatch): void {
		dispatch(recordAttempt(false));
		dispatch(midiActions.addWrongNote(wrongNote));
		dispatch(midiActions.waitUntilEmpty());
	}

	private onCorrect(index: number, dispatch: AppDispatch): void {
		dispatch(midiActions.waitUntilEmpty());
		const nextIndex = index + 1;
		if (nextIndex >= this.chords.length) {
			dispatch(recordAttempt(true));
		} else {
			dispatch(schedulerActions.incrementMultiPartCardIndex());
		}
	}
}

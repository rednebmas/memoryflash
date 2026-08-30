import { Midi, Note } from 'tonal';
import { midiActions } from '../redux/slices/midiSlice';
import { schedulerActions } from '../redux/slices/schedulerSlice';
import { recordAttempt } from '../redux/actions/record-attempt-action';
import { AppDispatch } from '../redux/store';
import { ChordMemoryChord, ChordNotation } from '../types/Cards';
import { chordNameToChromas, tonesToChromas } from './chordTones';
import { chordSymbolToChordName } from './romanNumerals';

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

const midiToChroma = (midi: number): number | null => Note.chroma(Midi.midiToNoteName(midi));

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
			dispatch(midiActions.requestClearClickedNotes());
			dispatch(midiActions.waitUntilEmpty());
			this.advance(index, dispatch);
		} else if (result.wrongNotes.length > 0) {
			dispatch(midiActions.addWrongNote(result.wrongNotes[0]));
			dispatch(midiActions.waitUntilEmpty());
			this.fail(dispatch);
		}
	}

	handleSymbol(
		symbol: string,
		notation: ChordNotation,
		index: number,
		dispatch: AppDispatch,
		key?: string,
	): boolean {
		const chord = this.chords[index];
		if (!chord) return false;
		const chordName = chordSymbolToChordName(symbol, notation, key);
		const correct =
			chordName !== null &&
			this.validateChromas(chordNameToChromas(chordName), chord).isCorrect;
		if (correct) this.advance(index, dispatch);
		else this.fail(dispatch);
		return correct;
	}

	validate(onNotes: number[], chord: ChordMemoryChord): ChordMemoryResult {
		const chromas = onNotes.map(midiToChroma);
		const result = this.validateChromas(chromas, chord);
		const wrongNotes = onNotes.filter((_, i) => result.wrongNotes.includes(i));
		return { ...result, wrongNotes };
	}

	validateChromas(chromas: Array<number | null>, chord: ChordMemoryChord): ChordMemoryResult {
		const requiredChromas = tonesToChromas(chord.requiredTones);
		const allowed = new Set([...requiredChromas, ...tonesToChromas(chord.optionalTones)]);
		const wrongNotes: number[] = [];
		chromas.forEach((chroma, i) => {
			if (typeof chroma === 'number' && !allowed.has(chroma)) wrongNotes.push(i);
		});
		if (wrongNotes.length > 0) return { isCorrect: false, isIncomplete: false, wrongNotes };

		const played = new Set(chromas);
		const hasAllRequired = requiredChromas.every((c) => played.has(c));
		return { isCorrect: hasAllRequired, isIncomplete: !hasAllRequired, wrongNotes: [] };
	}

	private computeAdded(onNotes: number[]): number[] {
		return onNotes.filter((n) => !this.prev.includes(n));
	}

	private fail(dispatch: AppDispatch): void {
		dispatch(recordAttempt(false));
	}

	private advance(index: number, dispatch: AppDispatch): void {
		if (index + 1 >= this.chords.length) {
			dispatch(recordAttempt(true));
		} else {
			dispatch(schedulerActions.incrementMultiPartCardIndex());
		}
	}
}

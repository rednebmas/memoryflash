import { Note, Interval } from 'tonal';
import { MultiSheetQuestion, StackedNotes } from '../types/MultiSheetCard';
import { majorKeys } from './notes';

function transposeStack(stack: StackedNotes[], interval: string): StackedNotes[] {
	return stack.map((sn) => ({
		...sn,
		notes: sn.notes.map((n) => {
			const transposed = Note.transpose(`${n.name}${n.octave}`, interval);
			const t = Note.get(transposed);
			return { name: t.pc, octave: t.oct || n.octave };
		}),
	}));
}

export function transposeQuestion(question: MultiSheetQuestion, key: string): MultiSheetQuestion {
	const interval = Interval.distance(question.key, key);
	return {
		...question,
		key,
		voices: question.voices.map((v) => ({
			...v,
			stack: transposeStack(v.stack, interval),
		})),
	};
}

function questionMinMaxMidi(question: MultiSheetQuestion) {
	let min = Infinity;
	let max = -Infinity;
	question.voices.forEach((v) =>
		v.stack.forEach((sn) =>
			sn.notes.forEach((n) => {
				const midi = Note.midi(`${n.name}${n.octave}`);
				if (midi == null) return;
				min = Math.min(min, midi);
				max = Math.max(max, midi);
			}),
		),
	);
	return { min, max };
}

function shiftQuestion(question: MultiSheetQuestion, octaves: number): MultiSheetQuestion {
	return {
		...question,
		voices: question.voices.map((v) => ({
			...v,
			stack: v.stack.map((sn) => ({
				...sn,
				notes: sn.notes.map((n) => ({
					...n,
					octave: n.octave + octaves,
				})),
			})),
		})),
	};
}

export function chooseBestOctave(
	question: MultiSheetQuestion,
	lowest: string,
	highest: string,
): MultiSheetQuestion {
	let q = JSON.parse(JSON.stringify(question)) as MultiSheetQuestion;
	const minMidi = Note.midi(lowest)!;
	const maxMidi = Note.midi(highest)!;
	const center = (minMidi + maxMidi) / 2;

	const midis: number[] = [];
	question.voices.forEach((v) =>
		v.stack.forEach((sn) =>
			sn.notes.forEach((n) => {
				const midi = Note.midi(`${n.name}${n.octave}`);
				if (midi != null) midis.push(midi);
			}),
		),
	);

	if (!midis.length) return q;

	let bestShift = 0;
	let bestScore = Infinity;
	for (let shift = -3; shift <= 3; shift++) {
		const shiftedMidis = midis.map((m) => m + 12 * shift);
		const avg = shiftedMidis.reduce((a, b) => a + b, 0) / midis.length;
		const score = Math.abs(avg - center);
		if (score < bestScore) {
			bestScore = score;
			bestShift = shift;
		}
	}

	return shiftQuestion(q, bestShift);
}

export function questionsForAllMajorKeys(
	base: MultiSheetQuestion,
	lowest: string,
	highest: string,
): MultiSheetQuestion[] {
	const baseKey = base.key;
	return majorKeys.map((key) =>
		key === baseKey
			? transposeQuestion(base, key) // No octave choice for base—keep input pitches exact
			: chooseBestOctave(transposeQuestion(base, key), lowest, highest),
	);
}

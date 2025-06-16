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

export function fitQuestionToRange(
	question: MultiSheetQuestion,
	lowest: string,
	highest: string,
): MultiSheetQuestion {
	let q = JSON.parse(JSON.stringify(question)) as MultiSheetQuestion;
	const minMidi = Note.midi(lowest)!;
	const maxMidi = Note.midi(highest)!;
	let { min, max } = questionMinMaxMidi(q);
	while (min < minMidi) {
		q = shiftQuestion(q, 1);
		min += 12;
		max += 12;
	}
	while (max > maxMidi) {
		q = shiftQuestion(q, -1);
		min -= 12;
		max -= 12;
	}
	return q;
}

export function questionsForAllMajorKeys(
	base: MultiSheetQuestion,
	lowest: string,
	highest: string,
): MultiSheetQuestion[] {
	return majorKeys.map((key) =>
		fitQuestionToRange(transposeQuestion(base, key), lowest, highest),
	);
}

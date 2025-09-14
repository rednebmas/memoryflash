import { activeNotesAt, computeTieAdvance, ScoreTimeline } from './scoreTimeline';
import { midiActions } from '../redux/slices/midiSlice';
import { schedulerActions } from '../redux/slices/schedulerSlice';
import { recordAttempt } from '../redux/actions/record-attempt-action';
import { AppDispatch } from '../redux/store';

export type ProjectFn = (midi: number) => number;

interface HandleArgs {
	onNotes: number[];
	waiting: boolean;
	index: number;
	dispatch: AppDispatch;
}

export class ValidatorEngine {
	private prev: number[] = [];
	private timings = new Map<number, { start?: number; end?: number }>();
	constructor(
		private timeline: ScoreTimeline,
		private project: ProjectFn = (n) => n,
	) {}

	handle({ onNotes, waiting, index, dispatch }: HandleArgs): void {
		this.updateTimings(onNotes);
		if (waiting) return;
		const expected = activeNotesAt(this.timeline, index).map(this.project);
		const played = onNotes.map(this.project);
		if (!this.matches(played, expected)) {
			this.onWrong(played, expected, onNotes, dispatch);
			return;
		}
		if (played.length === expected.length) this.onCorrect(index, dispatch);
	}

	private matches(played: number[], expected: number[]): boolean {
		return played.every((n) => expected.includes(n));
	}

	private onWrong(
		played: number[],
		expected: number[],
		raw: number[],
		dispatch: AppDispatch,
	): void {
		dispatch(recordAttempt(false));
		const wrong = played.find((n) => !expected.includes(n));
		if (typeof wrong === 'number')
			dispatch(midiActions.addWrongNote(raw[played.indexOf(wrong)]));
		dispatch(midiActions.waitUntilEmpty());
	}

	private onCorrect(index: number, dispatch: AppDispatch): void {
		dispatch(midiActions.waitUntilEmpty());
		const { nextIndex, isCompleted } = computeTieAdvance(this.timeline, index);
		if (isCompleted) dispatch(recordAttempt(true));
		else
			for (let i = 0; i < nextIndex - index; i++)
				dispatch(schedulerActions.incrementMultiPartCardIndex());
	}

	private updateTimings(onNotes: number[]): void {
		const now = Date.now();
		const added = onNotes.filter((n) => !this.prev.includes(n));
		const removed = this.prev.filter((n) => !onNotes.includes(n));
		added.forEach((n) => this.timings.set(n, { start: now }));
		removed.forEach((n) => {
			const t = this.timings.get(n);
			if (t) t.end = now;
		});
		this.prev = onNotes;
	}
}

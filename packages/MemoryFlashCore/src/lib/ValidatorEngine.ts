import { activeNotesAt, arraysEqual, ScoreTimeline } from './scoreTimeline';
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

/**
 * Once you've pressed all the notes at the current index, that note is good, you never need
 * to press it again.
 */
export class ValidatorEngine {
	private prev: number[] = [];
	constructor(
		private timeline: ScoreTimeline,
		private project: ProjectFn = (n) => n,
	) {}

	handle({ onNotes, waiting, index, dispatch }: HandleArgs): void {
		const added = this.computeAdded(onNotes);
		this.prev = onNotes;
		if (waiting || added.length === 0) return;

		const beat = this.buildBeatContext(index);
		this.logBeat(beat, added);
		const projected = this.projectBeat({ onNotes, added, ...beat });
		if (this.isCorrect(projected)) {
			this.onCorrect(index, dispatch);
		} else if (this.hasWrongNotes(projected.added, projected.expectedOnBeat)) {
			this.onWrong(projected.added, projected.expectedOnBeat, added, dispatch);
		}
	}

	private computeAdded(onNotes: number[]): number[] {
		return onNotes.filter((n) => !this.prev.includes(n));
	}

	private buildBeatContext(index: number) {
		const expectedOnThisBeat = activeNotesAt(this.timeline, index);
		const expectedAddedOnThisBeat = expectedOnThisBeat.filter(
			(n) => n.start === this.timeline.beats[index],
		);
		return { expectedOnThisBeat, expectedAddedOnThisBeat };
	}

	private logBeat(
		{ expectedAddedOnThisBeat }: ReturnType<ValidatorEngine['buildBeatContext']>,
		added: number[],
	): void {
		console.log(
			'[validation] expectedAddedOnThisBeat:',
			JSON.stringify(expectedAddedOnThisBeat.map((n) => n.midi)),
		);
		console.log('[validation] added:', JSON.stringify(added));
	}

	private projectBeat({
		onNotes,
		added,
		expectedOnThisBeat,
		expectedAddedOnThisBeat,
	}: {
		onNotes: number[];
		added: number[];
		expectedOnThisBeat: ReturnType<typeof activeNotesAt>;
		expectedAddedOnThisBeat: ReturnType<typeof activeNotesAt>;
	}) {
		const onNotesProjected = onNotes.map(this.project);
		const expectedOnBeat = expectedOnThisBeat.map((n) => this.project(n.midi));
		const expectedAdded = expectedAddedOnThisBeat.map((n) => this.project(n.midi));
		return {
			onNotes: onNotesProjected,
			expectedOnBeat,
			expectedAdded,
			added: added.map(this.project),
		};
	}

	private isCorrect({
		onNotes,
		expectedOnBeat,
		expectedAdded,
		added,
	}: ReturnType<ValidatorEngine['projectBeat']>): boolean {
		return arraysEqual(expectedOnBeat, onNotes) || arraysEqual(expectedAdded, added);
	}

	private hasWrongNotes(added: number[], expectedOnBeat: number[]): boolean {
		return added.some((note) => !expectedOnBeat.includes(note));
	}

	private onWrong(
		addedProjected: number[],
		expectedOnBeat: number[],
		addedRaw: number[],
		dispatch: AppDispatch,
	): void {
		console.log('[validation] onWrong', addedProjected, expectedOnBeat);

		dispatch(recordAttempt(false));
		const wrongIdx = addedProjected.findIndex((n) => !expectedOnBeat.includes(n));
		if (wrongIdx !== -1) dispatch(midiActions.addWrongNote(addedRaw[wrongIdx]));
		dispatch(midiActions.waitUntilEmpty());
	}

	private onCorrect(index: number, dispatch: AppDispatch): void {
		dispatch(midiActions.requestClearClickedNotes());
		dispatch(midiActions.waitUntilEmpty());
		const nextIndex = index + 1;
		if (nextIndex + 1 == this.timeline.beats.length) {
			dispatch(recordAttempt(true));
		} else {
			dispatch(schedulerActions.incrementMultiPartCardIndex());
		}
	}
}

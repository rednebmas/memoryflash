import { activeNotesAt, arraysEqual, computeTieAdvance, ScoreTimeline } from './scoreTimeline';
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

	handle({ onNotes, index, dispatch }: HandleArgs): void {
		const added = onNotes.filter((n) => !this.prev.includes(n));
		const expectedOnThisBeat = activeNotesAt(this.timeline, index);
		const expectedAddedOnThisBeat = expectedOnThisBeat.filter(
			(n) => n.start == this.timeline.beats[index],
		);
		const expectedAddedOnThisBeatMidis = expectedAddedOnThisBeat.map((n) => n.midi);

		console.log(
			'[validation] expectedAddedOnThisBeat:',
			JSON.stringify(expectedAddedOnThisBeat.map((n) => n.midi)),
		);

		console.log('[validation] added:', JSON.stringify(added));

		this.prev = onNotes;

		if (added.length == 0) return; // i might want || waiting here

		const onNotesProjected = onNotes.map(this.project);
		const expectedOnThisBeatMidisProjected = expectedOnThisBeat
			.map((n) => n.midi)
			.map(this.project);
		const expectedAddedOnThisBeatMidisProjected = expectedAddedOnThisBeatMidis.map(
			this.project,
		);

		const addedProjected = added.map(this.project);

		if (
			arraysEqual(expectedOnThisBeatMidisProjected, onNotesProjected) ||
			// just expected added on this beat is allowed because if the user made a mistake, we
			// don't require them to press a previously held note to continue.
			arraysEqual(expectedAddedOnThisBeatMidisProjected, addedProjected)
		) {
			this.onCorrect(index, dispatch);
		} else if (
			addedProjected
				.map(this.project)
				.reduce(
					(acc, added) => acc || !expectedOnThisBeatMidisProjected.includes(added),
					false,
				)
		) {
			this.onWrong(addedProjected, expectedAddedOnThisBeatMidisProjected, onNotes, dispatch);
		}
	}

	private onWrong(
		onNotesProjected: number[],
		expectedProjected: number[],
		onNotesRaw: number[],
		dispatch: AppDispatch,
	): void {
		console.log('[validation] onWrong', onNotesProjected, expectedProjected);

		dispatch(recordAttempt(false));
		const wrong = onNotesProjected.find((n) => !expectedProjected.includes(n));
		if (typeof wrong === 'number')
			dispatch(midiActions.addWrongNote(onNotesRaw[onNotesProjected.indexOf(wrong)]));
		dispatch(midiActions.waitUntilEmpty());
	}

	private onCorrect(index: number, dispatch: AppDispatch): void {
		dispatch(midiActions.waitUntilEmpty());
		const nextIndex = index + 1;
		if (nextIndex + 1 == this.timeline.beats.length) {
			dispatch(recordAttempt(true));
		} else {
			dispatch(schedulerActions.incrementMultiPartCardIndex());
		}
	}
}

import { isSameNoteName } from '../../lib/noteNames';
import { currentNoteNameSelector } from '../selectors/instrumentSelector';
import { SyncAppThunk } from '../store';
import { recordAttempt } from './record-attempt-action';

export const answerNoteName =
	(name: string, onResult: (correct: boolean) => void): SyncAppThunk =>
	(dispatch, getState) => {
		const expected = currentNoteNameSelector(getState());
		if (!expected) return;
		const correct = isSameNoteName(name, expected);
		dispatch(recordAttempt(correct));
		onResult(correct);
	};

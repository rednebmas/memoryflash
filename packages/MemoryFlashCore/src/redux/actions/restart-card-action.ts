import { midiActions } from '../slices/midiSlice';
import { schedulerActions } from '../slices/schedulerSlice';
import { SyncAppThunk } from '../store';

export const restartCard = (): SyncAppThunk => (dispatch) => {
	dispatch(midiActions.waitUntilEmpty());
	dispatch(schedulerActions.restartCurrCard());
};

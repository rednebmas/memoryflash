import { midiActions } from '../slices/midiSlice';
import { schedulerActions } from '../slices/schedulerSlice';
import { SyncAppThunk } from '../store';
import { canRestartCardSelector } from '../selectors/retryStatusSelector';

export const restartCard = (): SyncAppThunk => (dispatch, getState) => {
	if (!canRestartCardSelector(getState())) return;
	dispatch(midiActions.waitUntilEmpty());
	dispatch(schedulerActions.restartCurrCard());
};

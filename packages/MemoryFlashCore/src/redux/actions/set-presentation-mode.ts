import { settingsActions } from '../slices/settingsSlice';
import { AppThunk } from '../store';

export const setPresentationMode =
	(cardType: string, mode: string): AppThunk =>
	async (dispatch, getState, { persistStore }) => {
		dispatch(settingsActions.setPresentationMode({ cardType, mode }));
		persistStore(getState());
	};

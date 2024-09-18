import { PresentationModeIds } from '../../types/PresentationMode';
import { settingsActions } from '../slices/settingsSlice';
import { AppThunk } from '../store';

export const setPresentationMode =
	(cardType: string, mode: PresentationModeIds): AppThunk =>
	async (dispatch, getState, { persistStore }) => {
		dispatch(settingsActions.setPresentationMode({ cardType, mode }));
		persistStore(getState());
	};

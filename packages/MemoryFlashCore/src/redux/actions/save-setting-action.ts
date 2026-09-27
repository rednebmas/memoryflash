import { Action } from '@reduxjs/toolkit';
import { AppThunk } from '../store';

export const saveSetting =
	(action: Action): AppThunk =>
	async (dispatch, getState, { persistStore }) => {
		dispatch(action);
		persistStore(getState());
	};

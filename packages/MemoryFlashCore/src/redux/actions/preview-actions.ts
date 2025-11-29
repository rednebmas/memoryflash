import { communityActions } from '../slices/communitySlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';

export const getDeckPreview =
	(deckId: string): AppThunk =>
	async (dispatch, _, { api }) => {
		await networkCallWithReduxState(dispatch, 'getDeckPreview', async () => {
			const res = await api.get(`/decks/${deckId}/preview`);
			dispatch(communityActions.setDeckPreview(res.data));
		});
	};

export const getCoursePreview =
	(courseId: string): AppThunk =>
	async (dispatch, _, { api }) => {
		await networkCallWithReduxState(dispatch, 'getCoursePreview', async () => {
			const res = await api.get(`/courses/${courseId}/preview`);
			dispatch(communityActions.setCoursePreview(res.data));
		});
	};

export const clearDeckPreview = (): AppThunk => async (dispatch) => {
	dispatch(communityActions.setDeckPreview(null));
};

export const clearCoursePreview = (): AppThunk => async (dispatch) => {
	dispatch(communityActions.setCoursePreview(null));
};

import { coursesActions } from '../slices/coursesSlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';
import { Visibility } from '../../types/Deck';

export const updateCourseVisibility =
	(courseId: string, visibility: Visibility): AppThunk =>
	async (dispatch, _, { api }) => {
		await networkCallWithReduxState(dispatch, 'updateCourseVisibility', async () => {
			const res = await api.patch(`/courses/${courseId}/visibility`, { visibility });
			dispatch(coursesActions.upsert([res.data.course]));
		});
	};

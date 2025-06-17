import { coursesActions } from '../slices/coursesSlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';

export const deleteCourse =
	(courseId: string): AppThunk =>
	async (dispatch, _, { api }) => {
		await networkCallWithReduxState(dispatch, 'deleteCourse', async () => {
			await api.delete('/courses/' + courseId);
			dispatch(coursesActions.remove(courseId));
		});
	};

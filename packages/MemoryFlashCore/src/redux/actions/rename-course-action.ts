import { coursesActions } from '../slices/coursesSlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';

export const renameCourse =
	(courseId: string, name: string): AppThunk =>
	async (dispatch, _, { api }) => {
		await networkCallWithReduxState(dispatch, 'renameCourse', async () => {
			const res = await api.patch('/courses/' + courseId, { name });
			dispatch(coursesActions.upsert([res.data.course]));
		});
	};

import { coursesActions } from '../slices/coursesSlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';

export const getCourses =
	(): AppThunk =>
	async (dispatch, _, { api }) => {
		await networkCallWithReduxState(dispatch, 'getCourses', async () => {
			const res = await api.get('/courses');
			dispatch(coursesActions.upsert(res.data.courses));
		});
	};

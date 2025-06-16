import { coursesActions } from '../slices/coursesSlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';

export const createCourse =
	(name: string): AppThunk =>
	async (dispatch, _, { api }) => {
		await networkCallWithReduxState(dispatch, 'createCourse', async () => {
			const res = await api.post('/courses', { name });
			dispatch(coursesActions.upsert([res.data.course]));
		});
	};

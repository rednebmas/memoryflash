import { coursesActions } from '../slices/coursesSlice';
import { decksActions } from '../slices/decksSlice';
import { userDeckStatsActions } from '../slices/userDeckStatsSlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';

export const getCourse =
	(courseId: string): AppThunk =>
	async (dispatch, _, { api }) => {
		await networkCallWithReduxState(dispatch, 'getCourse' + courseId, async () => {
			const res = await api.get('/courses/' + courseId);
			dispatch(coursesActions.upsert([res.data.course]));
			dispatch(decksActions.upsert(res.data.decks));
			dispatch(userDeckStatsActions.upsert(res.data.userDeckStats));
		});
	};

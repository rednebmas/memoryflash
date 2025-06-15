import { decksActions } from '../slices/decksSlice';
import { coursesActions } from '../slices/coursesSlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';

export const createDeck =
	(courseId: string, name: string): AppThunk =>
	async (dispatch, _, { api }) => {
		await networkCallWithReduxState(dispatch, 'createDeck', async () => {
			const res = await api.post('/decks', { courseId, name });
			dispatch(decksActions.upsert([res.data.deck]));
			if (res.data.course) {
				dispatch(coursesActions.upsert([res.data.course]));
			}
		});
	};

import { feedActions } from '../slices/feedSlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';

export const getFeed =
	(): AppThunk =>
	async (dispatch, _, { api }) => {
		await networkCallWithReduxState(dispatch, 'getFeed', async () => {
			const res = await api.get('/feed');
			dispatch(feedActions.setFeed(res.data.entries));
		});
	};

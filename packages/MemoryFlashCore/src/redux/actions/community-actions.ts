import { communityActions } from '../slices/communitySlice';
import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';

export const searchCommunityDecks =
	(query: string, page: number = 1): AppThunk =>
	async (dispatch, _, { api }) => {
		await networkCallWithReduxState(dispatch, 'searchCommunityDecks', async () => {
			const res = await api.get('/community/decks', { params: { q: query, page } });
			dispatch(
				communityActions.setDeckResults({
					decks: res.data.decks,
					total: res.data.total,
					page: res.data.page,
				}),
			);
		});
	};

export const searchCommunityCourses =
	(query: string, page: number = 1): AppThunk =>
	async (dispatch, _, { api }) => {
		await networkCallWithReduxState(dispatch, 'searchCommunityCourses', async () => {
			const res = await api.get('/community/courses', { params: { q: query, page } });
			dispatch(
				communityActions.setCourseResults({
					courses: res.data.courses,
					total: res.data.total,
					page: res.data.page,
				}),
			);
		});
	};

export const getLeaderboard =
	(): AppThunk =>
	async (dispatch, _, { api }) => {
		await networkCallWithReduxState(dispatch, 'getLeaderboard', async () => {
			const res = await api.get('/community/leaderboard');
			dispatch(communityActions.setLeaderboard(res.data.entries));
		});
	};

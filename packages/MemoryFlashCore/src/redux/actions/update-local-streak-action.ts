import { userStatsActions } from '../slices/userStatsSlice';
import { SyncAppThunk } from '../store';
import { getActivityDayKey } from '../util/activityDay';

export const updateLocalStreak =
	(attemptedAt: string): SyncAppThunk =>
	async (dispatch, getState) => {
		const timezone = getState().userStats.userStats?.timezone;
		const activityDay = getActivityDayKey(new Date(attemptedAt), timezone);
		dispatch(userStatsActions.updateStreakForActivityDay({ activityDay }));
	};

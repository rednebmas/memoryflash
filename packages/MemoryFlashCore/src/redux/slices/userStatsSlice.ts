import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserStatsType } from '../../types/UserStats';
import { dayGap } from '../util/activityDay';

export interface UserStatsState {
	userStats?: UserStatsType;
}

const initialState: UserStatsState = {};

const userStatsSlice = createSlice({
	name: 'userStats',
	initialState,
	reducers: {
		setUserStats(state, action: PayloadAction<UserStatsType | undefined>) {
			state.userStats = action.payload;
		},
		updateStreakForActivityDay(state, action: PayloadAction<{ activityDay: string }>) {
			if (!state.userStats) return;
			const { activityDay } = action.payload;
			if (state.userStats.lastActivityDate === activityDay) return;
			const gap = state.userStats.lastActivityDate
				? dayGap(state.userStats.lastActivityDate, activityDay)
				: 1;
			if (gap <= 0) return;
			const currentStreak = gap === 1 ? state.userStats.currentStreak + 1 : 1;
			const longestStreak = Math.max(currentStreak, state.userStats.longestStreak);
			state.userStats = {
				...state.userStats,
				currentStreak,
				longestStreak,
				lastActivityDate: activityDay,
			};
		},
	},
});

export const userStatsReducer = userStatsSlice.reducer;
export const userStatsActions = userStatsSlice.actions;

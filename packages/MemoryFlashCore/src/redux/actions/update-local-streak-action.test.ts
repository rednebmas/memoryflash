import { expect } from 'chai';
import { configureStore } from '@reduxjs/toolkit';
import { userStatsReducer, userStatsActions } from '../slices/userStatsSlice';
import { updateLocalStreak } from './update-local-streak-action';

const createTestStore = () =>
	configureStore({
		reducer: { userStats: userStatsReducer },
	});

describe('updateLocalStreak', () => {
	it('increments streak and updates lastActivityDate for a new day', async () => {
		const store = createTestStore();
		store.dispatch(
			userStatsActions.setUserStats({
				_id: '1',
				userId: '1',
				timezone: 'America/New_York',
				currentStreak: 1,
				longestStreak: 1,
				lastActivityDate: '2024-01-01',
				createdAt: new Date().toISOString() as any,
				updatedAt: new Date().toISOString() as any,
			}),
		);

		await (store.dispatch as any)(updateLocalStreak('2024-01-02T12:00:00Z'));

		const stats = store.getState().userStats.userStats!;
		expect(stats.currentStreak).to.equal(2);
		expect(stats.longestStreak).to.equal(2);
		expect(stats.lastActivityDate).to.equal('2024-01-02');
	});
});

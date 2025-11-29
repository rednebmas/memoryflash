import { promiseAll } from '../utils';
import { User } from '../models';
import { getOrCreateUserStats } from './userStatsService';

export async function userOnLoadInfo(userId: string, timezone?: string) {
	const [user, userStats] = await promiseAll([
		User.findById(userId),
		getOrCreateUserStats(userId, timezone),
	]);

	return {
		user: user?.toJSON(),
		userStats: userStats?.toJSON(),
	};
}

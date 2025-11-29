import { MongoId } from './helper-types';

export type UserStatsType = {
	_id: string;
	userId: string;
	timezone: string;
	currentStreak: number;
	longestStreak: number;
	lastActivityDate?: string;
	createdAt: Date;
	updatedAt: Date;
};

export type UserStatsMongo = Omit<UserStatsType, '_id' | 'userId'> & {
	_id: MongoId;
	userId: MongoId;
};

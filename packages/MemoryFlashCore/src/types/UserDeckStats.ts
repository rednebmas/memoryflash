import { MongoId } from './helper-types';

export type MedianHistoryValue = { median: number; date: Date };
export type MedianHistory = MedianHistoryValue[];
export type UserDeckStatsType = {
	_id: string;
	userId: string;
	deckId: string;
	attempts: {
		[key: string]: number; // time taken
	};
	medianTimeTaken: number;
	medianHistory: MedianHistory;
	createdAt: Date;
	updatedAt: Date;
};

export type UserDeckStatsMongo = Omit<UserDeckStatsType, '_id' | 'userId' | 'deckId'> & {
	_id: MongoId;
	userId: MongoId;
	deckId: MongoId;
};

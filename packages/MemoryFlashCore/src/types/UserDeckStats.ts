import { MongoId } from './helper-types';

export type MedianHistoryValue = { median: number; date: Date };
export type MedianHistory = MedianHistoryValue[];
export type UserDeckStatsType = {
	_id: MongoId;
	userId: MongoId;
	deckId: MongoId;
	attempts: {
		[key: string]: number; // time taken
	};
	medianTimeTaken: number;
	medianHistory: MedianHistory;
	createdAt: Date;
	updatedAt: Date;
};

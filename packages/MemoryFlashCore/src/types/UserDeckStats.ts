import { CardReviews, SchedulerChoice } from '../lib/schedulers/types';
import { RhythmSettings } from '../lib/rhythm/types';
import { TempoLadder } from '../lib/rhythm/tempoLadder';
import { MongoId } from './helper-types';
import { SkippedCards } from '../lib/skippedCards';

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
	hiddenCardIds: string[];
	skippedCards?: SkippedCards;
	reviews?: CardReviews;
	recallClock?: number;
	scheduler?: SchedulerChoice;
	missRepeats?: number;
	rhythm?: RhythmSettings;
	rhythmLadder?: TempoLadder;
	createdAt: Date;
	updatedAt: Date;
};

export type UserDeckStatsMongo = Omit<UserDeckStatsType, '_id' | 'userId' | 'deckId'> & {
	_id: MongoId;
	userId: MongoId;
	deckId: MongoId;
};

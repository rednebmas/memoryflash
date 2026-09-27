import ObjectId from 'bson-objectid';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CardReview, CardReviews } from '../../lib/schedulers/types';

export interface SchedulerState {
	deck?: string;
	batchId: string;
	currCard?: string;
	nextCards: string[];
	answeredCards: string[];
	currStartTime: number;
	incorrect?: boolean;
	multiPartCardIndex: number;
	sessionReviews: CardReviews;
	sessionTicks: number;
}

const initialState: SchedulerState = {
	batchId: '__init__',
	currStartTime: 0,
	nextCards: [],
	answeredCards: [],
	multiPartCardIndex: 0,
	sessionReviews: {},
	sessionTicks: 0,
};

const dequeueNextCard = (state: SchedulerState) => {
	if (state.nextCards.length == 0) {
		return;
	}
	if (state.currCard) {
		state.answeredCards.push(state.currCard!);
	}
	state.nextCards.shift();
	pickupNextCard(state);
};

const pickupNextCard = (state: SchedulerState) => {
	state.currCard = state.nextCards[0];
	state.currStartTime = Date.now();
	state.batchId = new ObjectId().toHexString();
	state.multiPartCardIndex = 0;
	state.incorrect = undefined;
};

const MISS_REQUEUE_GAPS = [2, 4];

const insertApart = (queue: string[], cardId: string, gap: number) => {
	const index = Math.min(gap, queue.length);
	if (queue[index - 1] === cardId || queue[index] === cardId) return;
	queue.splice(index, 0, cardId);
};

const resetQueue = (state: SchedulerState) => {
	state.answeredCards = [];
	state.nextCards = [];
	state.currCard = undefined;
};

const schedulerSlice = createSlice({
	name: 'scheduler',
	initialState,
	reducers: {
		addToNextCards: (state, action: PayloadAction<string[]>) => {
			state.nextCards = [...state.nextCards, ...action.payload];
			if (!state.currCard) {
				pickupNextCard(state);
			}
		},
		setParsingDeck: (state, action: PayloadAction<string>) => {
			state.deck = action.payload;
			state.sessionReviews = {};
			state.sessionTicks = 0;
			resetQueue(state);
		},
		resetQueue,
		setSessionReview(state, action: PayloadAction<{ cardId: string; review: CardReview }>) {
			state.sessionReviews[action.payload.cardId] = action.payload.review;
			state.sessionTicks += 1;
		},
		startFromBeginningOfCurrentCard: (state) => {
			state.multiPartCardIndex = 0;
		},
		incrementMultiPartCardIndex(state) {
			state.multiPartCardIndex += 1;
		},
		markCurrIncorrect(state, action: PayloadAction<{ cardId: string; requeue: boolean }>) {
			state.incorrect = true;
			const { cardId, requeue } = action.payload;
			if (!requeue) return;
			MISS_REQUEUE_GAPS.forEach((gap) => insertApart(state.nextCards, cardId, gap));
		},
		insertCard(state, action: PayloadAction<{ cardId: string; gap: number }>) {
			insertApart(state.nextCards, action.payload.cardId, action.payload.gap);
			if (!state.currCard) pickupNextCard(state);
		},
		removeCard(state, action: PayloadAction<string>) {
			state.nextCards = state.nextCards.filter((id) => id !== action.payload);
			state.answeredCards = state.answeredCards.filter((id) => id !== action.payload);
			if (state.currCard === action.payload) {
				pickupNextCard(state);
			}
		},
		dequeueNextCard,
	},
});

export const schedulerReducer = schedulerSlice.reducer;
export const schedulerActions = schedulerSlice.actions;

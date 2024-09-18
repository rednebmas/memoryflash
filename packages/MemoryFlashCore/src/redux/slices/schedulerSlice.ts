import ObjectId from 'bson-objectid';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SchedulerState {
	deck?: string;
	batchId: string;
	currCard?: string;
	nextCards: string[];
	answeredCards: string[];
	currStartTime: number;
	incorrect?: boolean;
	multiPartCardIndex: number;
}

const initialState: SchedulerState = {
	batchId: '__init__',
	currStartTime: 0,
	nextCards: [],
	answeredCards: [],
	multiPartCardIndex: 0,
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
			state.answeredCards = [];
			state.nextCards = [];
			state.currCard = undefined;
		},
		incrementMultiPartCardIndex(state) {
			state.multiPartCardIndex += 1;
		},
		markCurrIncorrect(state, action: PayloadAction<string>) {
			state.incorrect = true;
			console.log(`[scheduling] Marking card as incorrect`);

			// So basically, in order to move to the next card, you must answer the current card correctly twice
			if (state.nextCards[1] !== action.payload) {
				console.log(`[scheduling] Queuing incorrect card`);
				state.nextCards.unshift(action.payload);
			}
			if (state.nextCards[2] !== action.payload) {
				console.log(`[scheduling] Queuing incorrect card again`);
				state.nextCards.unshift(action.payload);
			}
		},
		dequeueNextCard,
	},
});

export const schedulerReducer = schedulerSlice.reducer;
export const schedulerActions = schedulerSlice.actions;

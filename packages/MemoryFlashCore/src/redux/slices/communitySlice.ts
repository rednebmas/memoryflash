import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CommunityDeckResult {
	_id: string;
	name: string;
	course: string | null;
}

export interface CommunityCourseResult {
	_id: string;
	name: string;
	deckCount: number;
	totalCardCount: number;
}

export interface LeaderboardEntry {
	deckId: string;
	deckName: string;
	courseName: string | null;
	attemptCount: number;
}

export interface DeckPreview {
	deck: {
		_id: string;
		name: string;
		visibility: string;
		cardCount: number;
	};
	course: { _id: string; name: string } | null;
}

export interface CoursePreview {
	course: {
		_id: string;
		name: string;
		visibility: string;
		deckCount: number;
		totalCardCount: number;
	};
	decks: { _id: string; name: string; cardCount: number }[];
}

export interface CommunityState {
	deckResults: CommunityDeckResult[];
	deckResultsTotal: number;
	deckResultsPage: number;
	courseResults: CommunityCourseResult[];
	courseResultsTotal: number;
	courseResultsPage: number;
	leaderboard: LeaderboardEntry[];
	deckPreview: DeckPreview | null;
	coursePreview: CoursePreview | null;
}

const initialState: CommunityState = {
	deckResults: [],
	deckResultsTotal: 0,
	deckResultsPage: 1,
	courseResults: [],
	courseResultsTotal: 0,
	courseResultsPage: 1,
	leaderboard: [],
	deckPreview: null,
	coursePreview: null,
};

const communitySlice = createSlice({
	name: 'community',
	initialState,
	reducers: {
		setDeckResults(
			state,
			action: PayloadAction<{ decks: CommunityDeckResult[]; total: number; page: number }>,
		) {
			state.deckResults = action.payload.decks;
			state.deckResultsTotal = action.payload.total;
			state.deckResultsPage = action.payload.page;
		},
		setCourseResults(
			state,
			action: PayloadAction<{
				courses: CommunityCourseResult[];
				total: number;
				page: number;
			}>,
		) {
			state.courseResults = action.payload.courses;
			state.courseResultsTotal = action.payload.total;
			state.courseResultsPage = action.payload.page;
		},
		setLeaderboard(state, action: PayloadAction<LeaderboardEntry[]>) {
			state.leaderboard = action.payload;
		},
		setDeckPreview(state, action: PayloadAction<DeckPreview | null>) {
			state.deckPreview = action.payload;
		},
		setCoursePreview(state, action: PayloadAction<CoursePreview | null>) {
			state.coursePreview = action.payload;
		},
	},
});

export const communityReducer = communitySlice.reducer;
export const communityActions = communitySlice.actions;

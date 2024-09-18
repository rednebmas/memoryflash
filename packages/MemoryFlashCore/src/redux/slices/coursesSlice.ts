import { createSlice, createEntityAdapter, EntityState, PayloadAction } from '@reduxjs/toolkit';
import { Course } from '../../types/Course';

export const coursesAdapter = createEntityAdapter({
	selectId: (course: Course) => course._id,
});

export interface CoursesState extends EntityState<Course, string> {
	parsingCourse?: string;
}

const initialState: CoursesState = coursesAdapter.getInitialState({
	parsingCourse: undefined,
});

const coursesSlice = createSlice({
	name: 'courses',
	initialState,
	reducers: {
		upsert: coursesAdapter.upsertMany,
		setParsingCourse(state, action: PayloadAction<string>) {
			state.parsingCourse = action.payload;
		},
	},
});

export const coursesReducer = coursesSlice.reducer;
export const coursesActions = coursesSlice.actions;

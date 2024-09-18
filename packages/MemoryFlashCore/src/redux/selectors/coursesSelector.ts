import { createSelector } from '@reduxjs/toolkit';
import { ReduxState } from '../store';

const selectCoursesRedux = (state: ReduxState) => state.courses;

export const coursesSelector = createSelector([selectCoursesRedux], (courses) => {
	return Object.values(courses.entities);
});

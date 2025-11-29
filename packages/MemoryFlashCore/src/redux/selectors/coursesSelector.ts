import { createSelector } from '@reduxjs/toolkit';
import { ReduxState } from '../store';

const selectCoursesRedux = (state: ReduxState) => state.courses;
const selectUser = (state: ReduxState) => state.auth.user;

export const coursesSelector = createSelector([selectCoursesRedux], (courses) => {
	return Object.values(courses.entities);
});

export const userOwnedCoursesSelector = createSelector(
	[selectCoursesRedux, selectUser],
	(courses, user) => {
		if (!user) return [];
		return Object.values(courses.entities).filter((course) => course.userId === user._id);
	},
);

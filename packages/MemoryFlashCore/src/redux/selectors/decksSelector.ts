import { createSelector } from '@reduxjs/toolkit';
import { ReduxState } from '../store';
import { Deck } from '../../types/Deck';
import { UserDeckStatsType } from '../../types/UserDeckStats';
import { userDeckStatsByDeckIdSelector } from './userDeckStatsByDeckIdSelector';

const selectDecksRedux = (state: ReduxState) => state.decks;
const selectCoursesRedux = (state: ReduxState) => state.courses;

type DecksSelectorReturn = {
	[section: string]: Array<Deck & { stats: UserDeckStatsType | undefined }>;
};

export const decksSelector = createSelector(
	[selectDecksRedux, selectCoursesRedux, userDeckStatsByDeckIdSelector],
	(decksRedux, courseRedux, userDeckStats): DecksSelectorReturn => {
		if (!courseRedux.parsingCourse) return {};
		const course = courseRedux.entities[courseRedux.parsingCourse];
		if (!course) return {};

		const decks: DecksSelectorReturn = {};
		course.decks.forEach((deckId) => {
			const deck = decksRedux.entities[deckId];
			if (!deck) {
				return;
			}
			const key = deck.section + deck.sectionSubtitle;
			if (!decks[key]) {
				decks[key] = [{ ...deck, stats: userDeckStats[deckId] }];
			} else {
				decks[key].push({ ...deck, stats: userDeckStats[deckId] });
			}
		});

		return decks;
	},
);

import { createSelector } from '@reduxjs/toolkit';
import { ReduxState } from '../store';
import { RecentDeckFeedEntry } from '../../types/Feed';

const selectFeed = (state: ReduxState) => state.feed;

export const recentDeckFeedSelector = createSelector([selectFeed], (feed) => {
	return feed.entries.filter(
		(entry): entry is RecentDeckFeedEntry => entry.type === 'recentDeck',
	);
});

export const recentDeckFeedItemsSelector = createSelector(
	[recentDeckFeedSelector],
	(recentDecks) => {
		return recentDecks.map((entry) => {
			const date = new Date(entry.lastStudiedAt);
			const hasValidDate = !Number.isNaN(date.getTime());
			const subTitle = hasValidDate
				? `${entry.courseName} · ${date.toLocaleDateString()}`
				: entry.courseName;
			return {
				title: entry.deckName,
				subTitle,
				link: `/study/${entry.deckId}`,
			};
		});
	},
);

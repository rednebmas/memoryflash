export type FeedEntryType = 'recentDeck';

export type RecentDeckFeedEntry = {
	id: string;
	type: 'recentDeck';
	deckId: string;
	deckName: string;
	courseId: string;
	courseName: string;
	lastStudiedAt: string;
};

export type FeedEntry = RecentDeckFeedEntry;

export type FeedResponse = {
	entries: FeedEntry[];
};

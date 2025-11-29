export type DeckVisibility = 'private' | 'unlisted' | 'public';
export const DECK_VISIBILITIES: DeckVisibility[] = ['private', 'unlisted', 'public'];

export type Deck = {
	_id: string;
	// unique human readable id
	uid: string;
	courseId: string;
	name: string;
	section: string;
	sectionSubtitle: string;
	tags: string[];
	visibility?: DeckVisibility;
	importedFromDeckId?: string;
	createdAt: Date;
	updatedAt: Date;
};

export type DeckWithoutGeneratedFields = Omit<Deck, 'createdAt' | 'updatedAt' | '_id'>;

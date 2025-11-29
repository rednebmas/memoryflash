export type DeckVisibility = 'private' | 'unlisted' | 'public';

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
	// Reference to original deck if this was imported from another user
	importedFromDeckId?: string;
	createdAt: Date;
	updatedAt: Date;
};

export type DeckWithoutGeneratedFields = Omit<Deck, 'createdAt' | 'updatedAt' | '_id'>;

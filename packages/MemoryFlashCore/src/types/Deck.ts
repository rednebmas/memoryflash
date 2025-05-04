export type Deck = {
	_id: string;
	// unique human readable id
	uid: string;
	courseId: string;
	userId?: string;
	name: string;
	section: string;
	sectionSubtitle: string;
	tags: string[];
	createdAt: Date;
	updatedAt: Date;
};

export type DeckWithoutGeneratedFields = Omit<Deck, 'createdAt' | 'updatedAt' | '_id'>;

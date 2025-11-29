export type Visibility = 'private' | 'unlisted' | 'public';
export const VISIBILITIES: Visibility[] = ['private', 'unlisted', 'public'];
export const VISIBILITY_LEVEL: Record<Visibility, number> = { private: 0, unlisted: 1, public: 2 };

export type Deck = {
	_id: string;
	// unique human readable id
	uid: string;
	courseId: string;
	name: string;
	section: string;
	sectionSubtitle: string;
	tags: string[];
	cardCount?: number;
	visibility?: Visibility;
	importedFromDeckId?: string;
	createdAt: Date;
	updatedAt: Date;
};

export type DeckWithoutGeneratedFields = Omit<Deck, 'createdAt' | 'updatedAt' | '_id'>;

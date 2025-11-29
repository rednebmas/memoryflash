import { Visibility } from './Deck';

export type Course = {
	_id: string;
	name: string;
	decks: string[];
	userId?: string;
	visibility?: Visibility;
	importedFromCourseId?: string;
};

import { expect } from 'chai';
import { setupDBConnectionForTesting } from '../config/test-setup';
import { createCourse } from './coursesService';
import { createDeck, renameDeck } from './deckService';
import { User } from '../models';
import { Deck } from '../models/Deck';

describe('deck permissions', () => {
	setupDBConnectionForTesting();

	it("can't rename a deck you don't own", async () => {
		const user1 = await new User({
			firstName: 'A',
			lastName: 'User',
			email: 'a@test.com',
			passwordHash: 'hash',
		}).save();
		const user2 = await new User({
			firstName: 'B',
			lastName: 'User',
			email: 'b@test.com',
			passwordHash: 'hash',
		}).save();

		const course = await createCourse('Test', user1._id.toString());
		const deck = await createDeck(course._id.toString(), 'Original');

		const updated = await renameDeck(deck._id.toString(), 'NewName', user2._id.toString());
		expect(updated).to.be.null;
		const persisted = await Deck.findById(deck._id);
		expect(persisted?.name).to.equal('Original');
	});
});

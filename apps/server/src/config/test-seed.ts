import { User } from '../models';
import Course from '../models/Course';
import { generateIntervalCards } from '../services/card-generators/interval-generators';
import { upsertDeckWithCards } from '../services/card-generators/upsert-deck-with-cards';

const testing1PasswordHash = '$2a$04$L6mCkmKFXxQ/h.RgpdAae.4Frw9iOnZMof0aLmDMvF9D7taaBBqLC';

export async function seed() {
	const user = new User({
		firstName: 'Sam',
		lastName: 'Bender',
		email: 'sam@riker.tech',
		passwordHash: testing1PasswordHash,
	});
	await user.save();

	const course = new Course({ name: 'Intervals', decks: [] });
	await course.save();

	const { trebleSheetCards } = generateIntervalCards();

	const { deck } = await upsertDeckWithCards(
		{
			uid: 'treble clef intervals',
			courseId: course._id,
			name: 'Treble Clef',
			section: 'Sheet Music',
			sectionSubtitle: '',
			tags: ['sheet music'],
		},
		trebleSheetCards,
	);

	return {
		user,
		deck,
	};
}

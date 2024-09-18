import Course from '../../../models/Course';
import { DeckWithoutGeneratedFields as IDeck } from '../../../submodules/MemoryFlashCore/src/types/Deck';
import { createTwoHandedCardsFromProgressions } from '../create-two-handed-cards-from-progressions';
import { generateProgressionsFromRomanNumerals } from '../ii-V-i/ii-V-I-progression-generators';
import { upsertCourse } from '../upsert-course';

function generateBluesSpreadVoicingsV1() {
	const progressions = generateProgressionsFromRomanNumerals(
		['I7', 'V7', 'IV7', 'I7'],
		['A2', 'C7'],
		[
			{
				'7': ['1P 7m 10M 15P'],
			},
			{
				'7': ['1P 3M 7m 12M'],
			},
			{
				'7': ['1P 3M 7m 12M'],
			},
			{
				'7': ['1P 7m 10M 15P'],
			},
		],
	);

	return createTwoHandedCardsFromProgressions(
		'blues spread v1',
		'blues spread v1 in the key of',
		'blues spread v1 starting with',
		2,
		progressions,
	);
}

export async function generateBluesCourse() {
	let course = await Course.findOne({ name: 'The Blues' });
	if (!course) {
		course = new Course({ name: 'The Blues', decks: [] });
	}

	const { bluesSpreadVoicingsV1, bluesSpreadVoicingsV1Cards } = generateBluesDecks(course.id);

	return await upsertCourse(course, [[bluesSpreadVoicingsV1, bluesSpreadVoicingsV1Cards]]);
}

export function generateBluesDecks(courseId: string) {
	// https://pianowithjonny.com/piano-lessons/blues-chords-for-piano-the-complete-guide/
	// https://pwj-wordpress-content.s3.amazonaws.com/pda-media/pianowithjonny.com/wp-content/uploads/2024/01/Blues-Piano-Chords-that-Sound-Great-Level-1.png
	const bluesSpreadVoicingsV1: IDeck = {
		uid: 'blues spread v1',
		courseId,
		name: 'Blues Turn Around Spread V1',
		section: 'Simple',
		sectionSubtitle: '',
		tags: ['both hands'],
	};

	return {
		bluesSpreadVoicingsV1,
		bluesSpreadVoicingsV1Cards: generateBluesSpreadVoicingsV1(),
	};
}

import Course from '../../../models/Course';
import { DeckWithoutGeneratedFields as IDeck } from '../../../submodules/MemoryFlashCore/src/types/Deck';
import { createTwoHandedCardsFromProgressions } from '../create-two-handed-cards-from-progressions';
import { generateProgressionsFromRomanNumerals } from '../ii-V-i/ii-V-I-progression-generators';
import { upsertCourse } from '../upsert-course';

function generateSimpleVoicingsV1() {
	const progressions = generateProgressionsFromRomanNumerals(
		['I', 'V', 'vim', 'IV'],
		['A2', 'C7'],
		[
			{
				M: ['1P 8P 10M 12M'],
			},
			{
				M: ['1P 10M 12M 15P'],
			},
			{
				m: ['1P 8P 10m 12M'],
			},
			{
				M: ['1P 10M 12M 15P'],
			},
		],
	);

	// console.log('pop progression 1:', JSON.stringify(progressions[0], null, 4));

	return createTwoHandedCardsFromProgressions(
		'pop both hands v1',
		'pop v1 in the key of',
		'pop v1 starting with',
		1,
		progressions,
	);
}

function generateSimpleVoicingsV2() {
	const progressions = generateProgressionsFromRomanNumerals(
		['I', 'V', 'vim', 'IV'],
		['A2', 'C7'],
		[
			{
				M: ['1P 5P 8P 10M'],
			},
			{
				M: ['1P 8P 10M 12M'],
			},
			{
				m: ['1P 8P 10m 12M'],
			},
			{
				M: ['1P 10M 12M 15P'],
			},
		],
	);

	// console.log('pop progression 1:', JSON.stringify(progressions[0], null, 4));

	return createTwoHandedCardsFromProgressions(
		'pop both hands v2',
		'pop v2 in the key of',
		'pop v2 starting with',
		1,
		progressions,
	);
}

export async function generatePopCourse() {
	let course = await Course.findOne({ name: 'Pop' });
	if (!course) {
		course = new Course({ name: 'Pop', decks: [] });
	}

	const {
		simplePopVoicingV1,
		simplePopVoicingV1Cards,
		simplePopVoicingV2,
		simplePopVoicingV2Cards,
	} = generatePopDecks(course.id);

	await upsertCourse(course, [
		[simplePopVoicingV1, simplePopVoicingV1Cards],
		[simplePopVoicingV2, simplePopVoicingV2Cards],
	]);
}

export function generatePopDecks(courseId: string) {
	const simplePopVoicingV1: IDeck = {
		uid: 'pop I V vi IV v1',
		courseId,
		name: 'The Four Chords Both Hands V1',
		section: 'Simple',
		sectionSubtitle: '',
		tags: ['both hands'],
	};

	const simplePopVoicingV2: IDeck = {
		uid: 'pop I V vi IV v2',
		courseId,
		name: 'The Four Chords Both Hands V2',
		section: 'Simple',
		sectionSubtitle: '',
		tags: ['both hands'],
	};

	return {
		simplePopVoicingV2,
		simplePopVoicingV2Cards: generateSimpleVoicingsV2(),
		simplePopVoicingV1,
		simplePopVoicingV1Cards: generateSimpleVoicingsV1(),
	};
}

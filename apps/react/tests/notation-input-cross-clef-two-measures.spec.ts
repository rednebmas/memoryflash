import type { Page } from '@playwright/test';
import {
	test,
	expect,
	initDeterministicEnv,
	seedTestData,
	uiLogin,
	runRecorderEvents,
	createCourse,
	createDeck,
} from './helpers';
import { MultiSheetQuestion, Voice } from 'MemoryFlashCore/src/types/MultiSheetCard';

const trebleEvents = [[72], [76]];
const bassEvents = [[48], [52]];
const studyEvents = [
	[72, 48],
	[76, 52],
];

const ensureBassStartsOnMeasureOne = (question: MultiSheetQuestion) => {
	const bassVoice = question.voices.find((voice) => voice.staff === 'Bass');
	if (!bassVoice) throw new Error('Bass voice missing');
	expect(bassVoice.stack).toHaveLength(2);
	const [firstEntry] = bassVoice.stack;
	expect(firstEntry.rest).toBeFalsy();
	expect(firstEntry.notes.map((note) => `${note.name}${note.octave}`)).toEqual(['C3']);
};

const recordStaff = async (
	page: Page,
	clickButton: (name: string, options?: { exact?: boolean }) => Promise<void>,
	staff: Voice['staff'],
	events: number[][],
) => {
	await clickButton(staff === 'Bass' ? 'Bass' : 'Treble');
	await clickButton('w');
	await runRecorderEvents(page, undefined, events);
};

test('Notation input supports multi-measure cross-clef entry and study playback', async ({
	page,
	clickButton,
}) => {
	await initDeterministicEnv(page);
	await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');

	const courseId = await createCourse(page, 'Multi Measure Course');
	const deckId = await createDeck(page, courseId, 'Multi Measure Deck');
	await page.waitForURL(new RegExp(`/study/${deckId}/notation`));

	await recordStaff(page, clickButton, 'Treble', trebleEvents);
	await recordStaff(page, clickButton, 'Bass', bassEvents);

	const [addResp] = await Promise.all([
		page.waitForResponse(
			(r) => r.url().includes(`/decks/${deckId}/cards`) && r.request().method() === 'POST',
		),
		clickButton('Add Card'),
	]);
	expect(addResp.ok()).toBeTruthy();

	const postData = addResp.request().postDataJSON() as { questions?: MultiSheetQuestion[] };
	const question = postData.questions?.[0];
	if (!question) throw new Error('Missing question payload');
	ensureBassStartsOnMeasureOne(question);

	await page.goto(`/study/${deckId}`);
	await page.locator('.card-container').first().waitFor();
	await runRecorderEvents(page, undefined, studyEvents);
	const incorrect = await page.evaluate(
		() => (window as any).store.getState().scheduler.incorrect,
	);
	expect(incorrect).toBeFalsy();
	await page.unrouteAll({ behavior: 'ignoreErrors' });
});

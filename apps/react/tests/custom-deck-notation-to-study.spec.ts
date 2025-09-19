import {
	test,
	expect,
	screenshotOpts,
	uiLogin,
	seedTestData,
	initDeterministicEnv,
	runRecorderEvents,
	createCourse,
	createDeck,
} from './helpers';

const aMinor7Bass = [55, 45, 52, 48];

const trebleRecordEvents = [[72], [71, 69], [67], [64]];
const bassRecordEvents = [aMinor7Bass];

const studyEvents = [
	[72, ...aMinor7Bass],
	trebleRecordEvents[1].reverse(),
	trebleRecordEvents[2],
	trebleRecordEvents[3],
];

test('Create custom deck, add notation and text cards, then study', async ({
	page,
	getButton,
	clickButton,
}) => {
	await initDeterministicEnv(page);
	await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');

	const courseId = await createCourse(page, 'My Test Course');
	const deckId = await createDeck(page, courseId, 'My Deck');
	await page.waitForURL(new RegExp(`/study/${deckId}/notation`));

	// Record treble clef
	await runRecorderEvents(page, `/study/${deckId}/notation`, trebleRecordEvents, undefined);
	// Bass clef
	await clickButton('Bass');
	await clickButton('w');
	await runRecorderEvents(page, undefined, bassRecordEvents, undefined);

	const [addResp] = await Promise.all([
		page.waitForResponse(
			(r) => r.url().includes(`/decks/${deckId}/cards`) && r.request().method() === 'POST',
		),
		clickButton('Add Card'),
	]);
	expect(addResp.ok()).toBeTruthy();

	// Add a text-based flashcard
	await clickButton('Reset');
	await page.locator('button:has-text("Sheet Music")').click();
	await page.getByRole('menuitem', { name: 'Text Prompt' }).click();
	const promptText = 'Test Prompt';
	await page.fill('#text-prompt', promptText);

	// Record treble clef first
	await clickButton('q');
	await clickButton('Treble');
	await runRecorderEvents(page, undefined, trebleRecordEvents);
	// Switch to bass clef and record bass notes
	await clickButton('Bass');
	await clickButton('w');
	await runRecorderEvents(page, undefined, bassRecordEvents);
	const [addResp2] = await Promise.all([
		page.waitForResponse(
			(r) => r.url().includes(`/decks/${deckId}/cards`) && r.request().method() === 'POST',
		),
		clickButton('Add Card'),
	]);
	expect(addResp2.ok()).toBeTruthy();

	await page.goto(`/study/${deckId}`);
	const output = page.locator('#root');
	await output.waitFor();
	await expect(output).toHaveScreenshot('custom-deck-notation-to-study.png', screenshotOpts);

	// Open list view and ensure text card previews correctly
	await page.click('a[href="list"], a[href$="/list"]');
	await page.waitForURL(new RegExp(`/study/${deckId}/list`));
	await expect(page.locator('.card-container')).toHaveCount(2);
	await page.getByText(promptText, { exact: true }).waitFor();
	await expect(output).toHaveScreenshot('custom-deck-notation-to-study-list.png', screenshotOpts);

	// Edit text card and ensure it loads with existing data
        const textCard = page.locator('.card-container', { hasText: promptText });
        await textCard.getByRole('button', { name: 'Card options' }).click();
        await page.getByRole('menuitem', { name: 'Edit card' }).click();
	await page.waitForURL(new RegExp(`/study/${deckId}/edit/`));
	await expect(await getButton('Text Prompt')).toBeVisible();
	await expect(page.locator('#text-prompt')).toHaveValue(promptText);
	await page.evaluate(() => {
		window.scrollTo(0, 0);
		document.querySelector('.overflow-scroll')?.scrollTo(0, 600);
	});
	await expect(output).toHaveScreenshot(
		'custom-deck-notation-to-study-notation-input-edit.png',
		screenshotOpts,
	);

	// Go back to study screen and test the card
	await page.goto(`/study/${deckId}`);
	// Wait for the page to load
	await page.locator('.card-container').first().waitFor();

	await runRecorderEvents(
		page,
		undefined,
		studyEvents,
		'custom-deck-notation-to-study-midi-step',
	);

	// Navigate to the list and delete the first (notation) card
	await page.click('a[href="list"], a[href$="/list"]');
	await page.waitForURL(new RegExp(`/study/${deckId}/list`));
	await page.locator('.card-container').first().locator('.absolute.right-1.bottom-1').click();
	const [deleteResp3] = await Promise.all([
		page.waitForResponse(
			(r) => r.url().includes('/cards/') && r.request().method() === 'DELETE',
		),
		clickButton('Delete'),
	]);
	expect(deleteResp3.ok()).toBeTruthy();
	await expect(page.locator('.card-container')).toHaveCount(1);

	// Go back to study and answer the remaining text-based card
	await page.goto(`/study/${deckId}`);
	await page.locator('.card-container').first().waitFor();
	await runRecorderEvents(page, undefined, studyEvents, 'custom-deck-text-to-study-midi-step');

	// Cleanup any remaining routes to avoid teardown errors
	await page.unrouteAll({ behavior: 'ignoreErrors' });
});

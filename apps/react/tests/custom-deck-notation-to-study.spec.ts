import {
	test,
	expect,
	screenshotOpts,
	uiLogin,
	seedTestData,
	initDeterministicEnv,
	runRecorderEvents,
} from './helpers';

test('Create custom deck, add notation and text cards, then study', async ({ page }) => {
	await initDeterministicEnv(page);
	await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');

	await page.goto('/');
	await page.getByRole('button', { name: 'Create Course' }).click();
	await page.fill('#input-modal', 'My Test Course');
	const [createCourseResp] = await Promise.all([
		page.waitForResponse(
			(r) => r.url().endsWith('/courses') && r.request().method() === 'POST',
		),
		page.getByRole('button', { name: 'Save' }).click(),
	]);
	expect(createCourseResp.ok()).toBeTruthy();
	const { course } = await createCourseResp.json();
	const courseId = course?._id as string | undefined;
	expect(courseId).toBeTruthy();

	await page.goto(`/course/${courseId}`);
	await page.getByRole('button', { name: 'Create Deck' }).click();
	await page.fill('#input-modal', 'My Deck');
	const [createDeckResp] = await Promise.all([
		page.waitForResponse((r) => r.url().endsWith('/decks') && r.request().method() === 'POST'),
		page.getByRole('button', { name: 'Save' }).click(),
	]);
	expect(createDeckResp.ok()).toBeTruthy();
	const { deck } = await createDeckResp.json();
	const deckId = (deck?._id as string) || undefined;
	expect(deckId).toBeTruthy();
	await page.waitForURL(new RegExp(`/study/${deckId}/notation`));

	// Input a full measure: C4, E4, G4, C5 (quarter notes)
	await runRecorderEvents(page, `/study/${deckId}/notation`, [
		[45, 48, 52, 55, 72],
		[],
		[69, 71],
		[],
		[67],
		[],
		[64],
		[],
	]);

	const [addResp] = await Promise.all([
		page.waitForResponse(
			(r) => r.url().includes(`/decks/${deckId}/cards`) && r.request().method() === 'POST',
		),
		page.getByRole('button', { name: 'Add Card' }).click(),
	]);
	expect(addResp.ok()).toBeTruthy();

	// Add a text-based flashcard
	await page.getByRole('button', { name: 'Reset' }).click();
	await page.getByRole('button', { name: 'Sheet Music' }).click();
	await page.getByRole('button', { name: 'Text Prompt' }).click();
	const promptText = 'Test Prompt';
	await page.fill('#text-prompt', promptText);
	await runRecorderEvents(page, undefined, [
		[45, 48, 52, 55, 72],
		[],
		[69, 71],
		[],
		[67],
		[],
		[64],
		[],
	]);
	const [addResp2] = await Promise.all([
		page.waitForResponse(
			(r) => r.url().includes(`/decks/${deckId}/cards`) && r.request().method() === 'POST',
		),
		page.getByRole('button', { name: 'Add Card' }).click(),
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

	// Go back to study screen and test the card
	await page.goto(`/study/${deckId}`);
	// wait until the words "Sheet Music" appear
	await page.getByText('Sheet Music', { exact: true }).waitFor();

	await runRecorderEvents(
		page,
		undefined,
		[[45, 48, 52, 55, 72], [], [69, 71], [], [67], [], [64]],
		'custom-deck-notation-to-study-midi-step',
	);

	// Cleanup any remaining routes to avoid teardown errors
	await page.unrouteAll({ behavior: 'ignoreErrors' });
});

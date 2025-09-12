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

test('Create custom deck, add notation and text cards, then study', async ({ page }) => {
	await initDeterministicEnv(page);
	await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');

	const courseId = await createCourse(page, 'My Test Course');
	const deckId = await createDeck(page, courseId, 'My Deck');
	await page.waitForURL(new RegExp(`/study/${deckId}/notation`));

	// Input a full measure with shuffled order per chord
	await runRecorderEvents(page, `/study/${deckId}/notation`, [
		[72, 55, 45, 52, 48],
		[],
		[71, 69],
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
	await page.locator('button:has-text("Sheet Music")').click();
	await page.getByRole('menuitem', { name: 'Text Prompt' }).click();
	const promptText = 'Test Prompt';
	await page.fill('#text-prompt', promptText);
	await runRecorderEvents(page, undefined, [
		[72, 55, 45, 52, 48],
		[],
		[71, 69],
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
	// await expect(output).toHaveScreenshot('custom-deck-notation-to-study-list.png', screenshotOpts);

	// Edit text card and ensure it loads with existing data
	await page
		.locator('.card-container', { hasText: promptText })
		.locator('a[href*="/edit/"]')
		.click();
	await page.waitForURL(new RegExp(`/study/${deckId}/edit/`));
	await expect(page.getByRole('button', { name: 'Text Prompt' })).toBeVisible();
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
		[[72, 55, 45, 52, 48], [], [71, 69], [], [67], [], [64]],
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
		page.getByRole('button', { name: 'Delete' }).click(),
	]);
	expect(deleteResp3.ok()).toBeTruthy();
	await expect(page.locator('.card-container')).toHaveCount(1);

	// Go back to study and answer the remaining text-based card
	await page.goto(`/study/${deckId}`);
	await page.locator('.card-container').first().waitFor();
	await runRecorderEvents(
		page,
		undefined,
		[[72, 55, 45, 52, 48], [], [71, 69], [], [67], [], [64]],
		'custom-deck-text-to-study-midi-step',
	);

	// Cleanup any remaining routes to avoid teardown errors
	await page.unrouteAll({ behavior: 'ignoreErrors' });
});

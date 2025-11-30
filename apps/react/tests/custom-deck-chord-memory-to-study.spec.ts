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

// Cm7 chord (C, Eb, G, Bb)
const cm7Notes = [60, 63, 67, 70]; // C4, Eb4, G4, Bb4

test('Create custom deck with Chord Memory card, study it, then edit it', async ({
	page,
	getButton,
	clickButton,
}) => {
	await initDeterministicEnv(page);
	await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');

	const courseId = await createCourse(page, 'Chord Memory Test Course');
	const deckId = await createDeck(page, courseId, 'Chord Memory Deck');
	await page.waitForURL(new RegExp(`/study/${deckId}/notation`));

	// Select Chord Memory card type
	await page.locator('button:has-text("Sheet Music")').click();
	await page.getByRole('menuitem', { name: 'Chord Memory' }).click();

	// Enter chord progression
	await page.fill('#chord-progression', 'Cm7');
	await page.fill('#chord-text-prompt', 'C Minor 7 Practice');

	const [addResp] = await Promise.all([
		page.waitForResponse(
			(r) => r.url().includes(`/decks/${deckId}/cards`) && r.request().method() === 'POST',
		),
		clickButton('Add Card'),
	]);
	expect(addResp.ok()).toBeTruthy();

	// Navigate to study screen
	await page.goto(`/study/${deckId}`);
	const output = page.locator('#root');
	await output.waitFor();
	await expect(output).toHaveScreenshot(
		'custom-deck-chord-memory-to-study-question.png',
		screenshotOpts,
	);

	// Open list view and ensure chord memory card previews correctly
	await page.click('a[href="list"], a[href$="/list"]');
	await page.waitForURL(new RegExp(`/study/${deckId}/list`));
	await expect(page.locator('.card-container')).toHaveCount(1);
	await page.getByText('C Minor 7 Practice', { exact: true }).waitFor();
	await expect(output).toHaveScreenshot(
		'custom-deck-chord-memory-to-study-list.png',
		screenshotOpts,
	);

	// Edit chord memory card and ensure it loads with Chord Memory type (not Text Prompt)
	const chordCard = page.locator('.card-container', { hasText: 'C Minor 7 Practice' });
	await chordCard.getByRole('button', { name: 'Card options' }).click();
	await page.getByRole('menuitem', { name: 'Edit card' }).click();
	await page.waitForURL(new RegExp(`/study/${deckId}/edit/`));

	// Verify that "Chord Memory" is shown, not "Text Prompt"
	await expect(await getButton('Chord Memory')).toBeVisible();
	await expect(page.locator('#chord-progression')).toHaveValue('Cm7');
	await expect(page.locator('#chord-text-prompt')).toHaveValue('C Minor 7 Practice');

	// Update the card title and save
	await page.fill('#chord-text-prompt', 'Updated Cm7 Practice');
	await expect(page.locator('#chord-text-prompt')).toHaveValue('Updated Cm7 Practice');

	await page.evaluate(() => {
		window.scrollTo(0, 0);
		document.querySelector('.overflow-scroll')?.scrollTo(0, 600);
	});
	await expect(output).toHaveScreenshot('custom-deck-chord-memory-edit.png', screenshotOpts);

	const [updateResp] = await Promise.all([
		page.waitForResponse(
			(r) => r.url().includes('/cards/') && r.request().method() === 'PATCH',
		),
		clickButton('Update Card'),
	]);
	expect(updateResp.ok()).toBeTruthy();

	// Go back to study screen and verify the updated title is shown
	await page.goto(`/study/${deckId}`);
	await page.locator('.card-container').first().waitFor();
	await expect(output).toHaveScreenshot(
		'custom-deck-chord-memory-updated-question.png',
		screenshotOpts,
	);

	await runRecorderEvents(page, undefined, [cm7Notes], 'custom-deck-chord-memory-answer-step');

	// Cleanup any remaining routes to avoid teardown errors
	await page.unrouteAll({ behavior: 'ignoreErrors' });
});

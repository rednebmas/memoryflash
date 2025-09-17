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

	type StaffStep = { notes: number[]; staff: 'bass' | 'treble' | 'rest' };
	const splitStaffEvents = (events: number[][]): StaffStep[] =>
		events.flatMap((step) => {
			if (!step.length) return [{ notes: step, staff: 'rest' }];
			const bass = step.filter((note) => note < 60);
			const treble = step.filter((note) => note >= 60);
			const result: StaffStep[] = [];
			if (bass.length) result.push({ notes: bass, staff: 'bass' });
			if (treble.length) result.push({ notes: treble, staff: 'treble' });
			return result.length ? result : [{ notes: [], staff: 'rest' }];
		});

	const setStaff = async (staff: 'bass' | 'treble') => {
		await clickButton(staff === 'bass' ? 'Bass' : 'Treble');
	};

	const playEvents = async (events: number[][], prefix?: string, url?: string) => {
		const expanded = splitStaffEvents(events);
		if (!expanded.length) return;
		const steps = expanded.map((step) => step.notes);
		const findNextStaff = (index: number) =>
			expanded
				.slice(index + 1)
				.find((step) => step.staff === 'bass' || step.staff === 'treble')?.staff ?? null;
		let current =
			expanded.find((step) => step.staff === 'bass' || step.staff === 'treble')?.staff ??
			null;
		if (current && current !== 'rest') await setStaff(current);
		await runRecorderEvents(page, url, steps, prefix, async (index) => {
			const next = findNextStaff(index);
			if (next && next !== current && next !== 'rest') {
				await setStaff(next);
				current = next;
			}
		});
	};

	// Input a full measure with shuffled order per chord
	await playEvents(
		[[72, 55, 45, 52, 48], [], [71, 69], [], [67], [], [64], []],
		undefined,
		`/study/${deckId}/notation`,
	);

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
	await playEvents([[72, 55, 45, 52, 48], [], [71, 69], [], [67], [], [64], []]);
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
	await page
		.locator('.card-container', { hasText: promptText })
		.locator('a[href*="/edit/"]')
		.click();
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

	await playEvents(
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
		clickButton('Delete'),
	]);
	expect(deleteResp3.ok()).toBeTruthy();
	await expect(page.locator('.card-container')).toHaveCount(1);

	// Go back to study and answer the remaining text-based card
	await page.goto(`/study/${deckId}`);
	await page.locator('.card-container').first().waitFor();
	await playEvents(
		[[72, 55, 45, 52, 48], [], [71, 69], [], [67], [], [64]],
		'custom-deck-text-to-study-midi-step',
	);

	// Cleanup any remaining routes to avoid teardown errors
	await page.unrouteAll({ behavior: 'ignoreErrors' });
});

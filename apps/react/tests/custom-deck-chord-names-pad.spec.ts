import {
	test,
	expect,
	screenshotOpts,
	uiLogin,
	seedTestData,
	initDeterministicEnv,
	createCourse,
	createDeck,
} from './helpers';

const generatedSong = {
	title: 'Hotel California',
	artist: 'Eagles',
	key: 'Bm',
	patterns: [
		{
			id: 'A',
			chords: ['Bm', 'F#', 'A', 'E', 'G', 'D', 'Em', 'F#'],
			sections: ['Intro', 'Verse'],
		},
		{ id: 'B', chords: ['G', 'D', 'F#', 'Bm', 'G', 'D', 'Em', 'F#'], sections: ['Chorus'] },
	],
	cards: [
		{
			prompt: '[Verse] Hotel California',
			chords: ['Bm', 'F#', 'A', 'E', 'G', 'D', 'Em', 'F#'],
			key: 'Bm',
			notation: 'chordNames',
			patternId: 'A',
			invalidChords: [],
		},
		{
			prompt: '[Chorus · roman numerals] Hotel California',
			chords: ['G', 'D', 'F#', 'Bm', 'G', 'D', 'Em', 'F#'],
			key: 'Bm',
			notation: 'romanNumerals',
			patternId: 'B',
			invalidChords: [],
		},
	],
};

test('Answer a Chord Memory card with the chord-name pad, then generate cards with AI', async ({
	page,
	clickButton,
}) => {
	await initDeterministicEnv(page);
	await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');

	const courseId = await createCourse(page, 'Chord Names Test Course');
	const deckId = await createDeck(page, courseId, 'Chord Names Deck');
	await page.waitForURL(new RegExp(`/study/${deckId}/notation`));

	await page.locator('button:has-text("Sheet Music")').click();
	await page.getByRole('menuitem', { name: 'Chord Memory' }).click();
	await page.fill('#chord-progression', 'Bm F#');
	await page.fill('#chord-text-prompt', '[Verse] Hotel California');
	await page.selectOption('#chord-key', 'Bm');

	const [addResp] = await Promise.all([
		page.waitForResponse(
			(r) => r.url().includes(`/decks/${deckId}/cards`) && r.request().method() === 'POST',
		),
		clickButton('Add Card'),
	]);
	expect(addResp.ok()).toBeTruthy();

	await page.goto(`/study/${deckId}`);
	const output = page.locator('#root');
	await page.locator('.card-container').first().waitFor();
	await clickButton('Chord names');
	await expect(output).toHaveScreenshot('chord-names-pad.png', screenshotOpts);

	await clickButton('B');
	await clickButton('m');
	await clickButton('✓');
	await expect(output).toHaveScreenshot('chord-names-pad-step-1.png', screenshotOpts);

	await clickButton('G');
	await clickButton('✓');
	await expect(page.locator('svg.stroke-red-500')).toBeVisible();

	await clickButton('F');
	await clickButton('♯');
	const [attemptResp] = await Promise.all([
		page.waitForResponse(
			(r) => r.url().endsWith('/attempts') && r.request().method() === 'POST',
		),
		clickButton('✓'),
	]);
	expect(attemptResp.ok()).toBeTruthy();

	await page.goto(`/study/${deckId}/notation`);
	await page.locator('button:has-text("Sheet Music")').click();
	await page.getByRole('menuitem', { name: 'Generate with AI' }).click();
	await page.route('**/generate-cards', (route) =>
		route.fulfill({ json: { song: generatedSong } }),
	);
	await page.fill('#ai-text', '[Verse]\nBm F# A E G D Em F#');
	await clickButton('Generate preview');
	await page.getByText('Pattern B').first().waitFor();
	await expect(output).toHaveScreenshot('ai-generate-review.png', screenshotOpts);

	const [createResp] = await Promise.all([
		page.waitForResponse(
			(r) => r.url().includes(`/decks/${deckId}/cards`) && r.request().method() === 'POST',
		),
		clickButton('Create 2 cards'),
	]);
	expect(createResp.ok()).toBeTruthy();

	await page.goto(`/study/${deckId}/list`);
	await expect(page.locator('.card-container')).toHaveCount(3);
	await page.unrouteAll({ behavior: 'ignoreErrors' });
});

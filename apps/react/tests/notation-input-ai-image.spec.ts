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

const photo = new URL('./music-notation.spec.ts-snapshots/music-notation.png', import.meta.url)
	.pathname;

const song = {
	title: 'Photo Song',
	artist: '',
	key: 'C',
	patterns: [],
	cards: [
		{
			prompt: '[Verse] Photo Song',
			chords: ['C', 'Am', 'F', 'G'],
			key: 'C',
			notation: 'chordNames',
			patternId: 'A',
			invalidChords: [],
		},
	],
};

test('Attach a sheet music photo to Generate with AI', async ({ page, clickButton }) => {
	await initDeterministicEnv(page);
	await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');
	const courseId = await createCourse(page, 'AI Photo Course');
	const deckId = await createDeck(page, courseId, 'AI Photo Deck');
	await page.waitForURL(new RegExp(`/study/${deckId}/notation`));

	await page.locator('button:has-text("Sheet Music")').click();
	await page.getByRole('menuitem', { name: 'Generate with AI' }).click();
	await page.getByTestId('ai-image-input').setInputFiles(photo);
	await page.getByAltText('Attached').waitFor();
	const output = page.locator('#root');
	await expect(output).toHaveScreenshot('notation-input-ai-image-attached.png', screenshotOpts);

	let body: { text?: string; image?: string } = {};
	await page.route(`**/decks/${deckId}/generate-cards`, async (route) => {
		body = route.request().postDataJSON();
		await route.fulfill({ json: { song } });
	});
	await page.fill('#ai-text', 'transcribe the chords');
	await clickButton('Generate preview');
	await page.getByText('[Verse] Photo Song').first().waitFor();
	expect(body.text).toBe('transcribe the chords');
	expect(body.image).toMatch(/^data:image\/jpeg;base64,/);

	await page.getByLabel('Remove image').click();
	await expect(page.getByAltText('Attached')).toHaveCount(0);
});

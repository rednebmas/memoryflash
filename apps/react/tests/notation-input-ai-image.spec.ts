import {
	test,
	expect,
	screenshotOpts,
	uiLogin,
	seedTestData,
	initDeterministicEnv,
	createCourse,
	createDeck,
	mockGenerateCards,
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
			type: 'Sheet Music',
			prompt: '[Verse · Melody] Photo Song',
			question: {
				key: 'F',
				beatsPerBar: 2,
				voices: [
					{
						staff: 'Treble',
						stack: ['C', 'D', 'C', 'D'].map((name) => ({
							notes: [{ name, octave: 5 }],
							duration: '8',
						})),
					},
				],
				presentationModes: [{ id: 'Sheet Music' }],
			},
			problems: [],
		},
		{
			type: 'Chord Memory',
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

	const job = await mockGenerateCards(page, song);
	job.finished = false;
	await page.fill('#ai-text', 'transcribe the melody and the chords');
	await page.getByLabel('Chord Memory').check();
	await clickButton('Generate preview');
	const status = page.getByTestId('generation-status');
	await expect(status).toContainText('Generating… this usually takes about a minute');
	await expect(output).toHaveScreenshot('notation-input-ai-generating.png', {
		...screenshotOpts,
		mask: [status.locator('span')],
	});
	job.finished = true;
	await page.getByText('[Verse] Photo Song').first().waitFor();
	await expect(status).toHaveCount(0);
	await expect(output).toHaveScreenshot('notation-input-ai-sheet-review.png', screenshotOpts);
	expect(job.body.cardTypes).toEqual(['Sheet Music', 'Chord Memory']);
	expect(job.body.text).toBe('transcribe the melody and the chords');
	expect(job.body.image).toMatch(/^data:image\/jpeg;base64,/);

	await page.getByLabel('Remove image').click();
	await expect(page.getByAltText('Attached')).toHaveCount(0);
});

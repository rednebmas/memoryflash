import {
	test,
	expect,
	seedTestData,
	uiLogin,
	initDeterministicEnv,
	screenshotOpts,
	createCourse,
	createDeck,
} from './helpers';
import { API_URL } from './helpers/ports';

const question = {
	key: 'C',
	voices: [{ staff: 'Treble', stack: [{ notes: [{ name: 'G', octave: 4 }], duration: 'w' }] }],
	presentationModes: [{ id: 'Sheet Music' }],
};

test('Note names mode shows the sax fingering above the letter pad', async ({
	page,
	clickButton,
}) => {
	await initDeterministicEnv(page);
	await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');
	const courseId = await createCourse(page, 'Note Reading Test Course');
	const deckId = await createDeck(page, courseId, 'Lines & Spaces');
	const res = await page.request.post(`${API_URL}/decks/${deckId}/cards`, {
		data: { questions: [question] },
	});
	expect(res.ok()).toBeTruthy();

	await page.goto(`/study/${deckId}`);
	await page.locator('.card-container').first().waitFor();
	await clickButton('Note names');
	const fingering = page.getByText('Left 1, Left 2, Left 3');
	await expect(fingering).toHaveCount(0);
	await page.getByLabel('Show saxophone fingerings').check();
	await expect(fingering).toBeVisible();
	await expect(page.locator('#root')).toHaveScreenshot(
		'note-names-fingering.png',
		screenshotOpts,
	);

	const [attemptResp] = await Promise.all([
		page.waitForResponse(
			(r) => r.url().endsWith('/attempts') && r.request().method() === 'POST',
		),
		clickButton('G'),
	]);
	expect(attemptResp.ok()).toBeTruthy();
});

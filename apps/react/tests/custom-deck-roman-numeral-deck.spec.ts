import {
	test,
	expect,
	uiLogin,
	seedTestData,
	initDeterministicEnv,
	createCourse,
	createDeck,
} from './helpers';
import { API_URL } from './helpers/ports';

const chord = (names: string[], duration: string, tie?: object) => ({
	notes: names.map((n) => ({ name: n.slice(0, -1), octave: Number(n.slice(-1)) })),
	duration,
	...(tie ? { tie } : {}),
});

const question = {
	key: 'C',
	voices: [
		{
			staff: 'Treble',
			stack: [
				chord(['C4', 'E4', 'G4'], 'w'),
				chord(['C4', 'F4', 'A4'], 'h'),
				chord(['D4', 'F4', 'Bb4'], 'h'),
				chord(['B3', 'D4', 'G4'], 'w'),
			],
		},
	],
	presentationModes: [{ id: 'Sheet Music' }],
};

test('Sheet music card spins off a roman numeral deck', async ({ page }) => {
	await initDeterministicEnv(page);
	await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');
	const courseId = await createCourse(page, 'Roman Course');
	const deckId = await createDeck(page, courseId, 'Four bars');
	const res = await page.request.post(`${API_URL}/decks/${deckId}/cards`, {
		data: { questions: [question] },
	});
	expect(res.ok()).toBeTruthy();

	await page.goto(`/study/${deckId}`);
	await page.getByRole('button', { name: 'Card options' }).first().click();
	await page.getByRole('menuitem', { name: 'Practice as Roman numerals' }).click();
	await page.waitForURL((url) => !url.pathname.endsWith(deckId));
	await expect(page.getByText('Roman numeral deck created')).toBeVisible();
	await expect(page.getByText('I – IV – ♭VII – V').first()).toBeVisible();
	await expect(page.getByText(/^Key of /).first()).toBeVisible();

	await page.unrouteAll({ behavior: 'ignoreErrors' });
});

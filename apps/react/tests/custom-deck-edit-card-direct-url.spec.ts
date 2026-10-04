import { Page } from '@playwright/test';
import {
	test,
	expect,
	uiLogin,
	seedTestData,
	initDeterministicEnv,
	runRecorderEvents,
	createCourse,
	createDeck,
} from './helpers';

const events = [[72], [71], [67], [64]];

const expectPrefilled = async (page: Page) => {
	await expect(page.locator('[data-base-stack-length]')).toHaveAttribute(
		'data-base-stack-length',
		'4',
	);
	await expect(page.getByRole('button', { name: 'Update Card', exact: true })).toBeEnabled();
};

test('Opening an edit URL directly or reloading it prefills the editor', async ({
	page,
	clickButton,
}) => {
	await initDeterministicEnv(page);
	await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');

	const courseId = await createCourse(page, 'Direct Edit Course');
	const deckId = await createDeck(page, courseId, 'Direct Edit Deck');
	await runRecorderEvents(page, `/study/${deckId}/notation`, events, undefined);
	const [added] = await Promise.all([
		page.waitForResponse((r) => r.url().endsWith(`/decks/${deckId}/cards`)),
		clickButton('Add Card'),
	]);
	const cardId = (await added.json()).cards[0]._id;

	await page.goto(`/study/${deckId}/edit/${cardId}`);
	await expectPrefilled(page);
	await page.reload();
	await expectPrefilled(page);

	await page.goto(`/study/${deckId}/edit/000000000000000000000000`);
	await expect(page.getByText('Card not found')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Update Card' })).toHaveCount(0);

	await page.unrouteAll({ behavior: 'ignoreErrors' });
});

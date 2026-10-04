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

const ebEvents = [[63], [67], [70], [75]];

const openEditor = async (page: Page, deckId: string) => {
	await page.goto(`/study/${deckId}/list`);
	await page.getByRole('button', { name: 'Card options' }).first().click();
	await page.getByRole('menuitem', { name: 'Edit card' }).click();
	await page.waitForURL(new RegExp(`/study/${deckId}/edit/`));
};

test('Editing a card with transpositions keeps the card in its own key', async ({
	page,
	clickButton,
}) => {
	await page.setViewportSize({ width: 1366, height: 992 });
	await initDeterministicEnv(page);
	await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');

	const courseId = await createCourse(page, 'Transpose Course');
	const deckId = await createDeck(page, courseId, 'Transpose Deck');
	await page.goto(`/study/${deckId}/notation`);
	const keySelect = page.locator('label', { hasText: 'Key' }).locator('select');
	await keySelect.selectOption('Eb');
	await runRecorderEvents(page, undefined, ebEvents);
	await clickButton('Add Card');
	await expect(page.getByText('Card added')).toBeVisible();

	await openEditor(page, deckId);
	await expect(keySelect).toHaveValue('Eb');
	await page.getByRole('button', { name: /Transpositions/ }).click();
	await page.locator('label', { hasText: /^C$/ }).locator('input').check();

	const [patch, added] = await Promise.all([
		page.waitForRequest((r) => r.url().includes('/cards/') && r.method() === 'PATCH'),
		page.waitForResponse((r) => r.url().endsWith(`/decks/${deckId}/cards`)),
		clickButton('Update Card'),
	]);
	expect(patch.postDataJSON().question.key).toBe('Eb');
	expect(added.request().postDataJSON().questions[0].key).toBe('C');

	await openEditor(page, deckId);
	await expect(keySelect).toHaveValue('Eb');
	await page.goto(`/study/${deckId}/list`);
	await expect(page.locator('.card-container .svg-dark-mode svg')).toHaveCount(2);

	await page.unrouteAll({ behavior: 'ignoreErrors' });
});

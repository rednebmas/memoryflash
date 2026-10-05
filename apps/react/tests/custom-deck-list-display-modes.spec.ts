import {
	test,
	expect,
	uiLogin,
	seedTestData,
	initDeterministicEnv,
	setStaticScroll,
} from './helpers';
import { screenshotOpts } from './helpers/screenshotOptions';
import { seedSoEasyDeck } from './helpers/soEasyDeck';

test('Card list switches every card to the display mode picked in its chips', async ({ page }) => {
	await page.setViewportSize({ width: 1512, height: 862 });
	await initDeterministicEnv(page);
	await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');
	const { deckId } = await seedSoEasyDeck(page, 'List Modes Course', true);

	await page.goto(`/study/${deckId}/list`);
	await page.getByText('Roman Numerals', { exact: true }).click();
	await expect(page.getByText('Key of C')).toBeVisible();
	await setStaticScroll(page);
	await expect(page.locator('#root')).toHaveScreenshot('list-roman-numerals.png', screenshotOpts);

	await page.goto(`/study/${deckId}`);
	await expect(page.getByText(/^Key of/).first()).toBeVisible();
});

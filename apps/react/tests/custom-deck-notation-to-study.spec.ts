import { test, expect, screenshotOpts, uiLogin, seedTestData, stubMathRandom } from './helpers';

test('Create custom deck, add simple card, then study', async ({ page }) => {
	await stubMathRandom(page);
	await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');

	await page.goto('/');
	await page.getByRole('button', { name: 'Create Course' }).click();
	await page.fill('#input-modal', 'My Test Course');
	const [createCourseResp] = await Promise.all([
		page.waitForResponse(
			(r) => r.url().endsWith('/courses') && r.request().method() === 'POST',
		),
		page.getByRole('button', { name: 'Save' }).click(),
	]);
	expect(createCourseResp.ok()).toBeTruthy();
	const { course } = await createCourseResp.json();
	const courseId = course?._id as string | undefined;
	expect(courseId).toBeTruthy();

	await page.goto(`/course/${courseId}`);
	await page.getByRole('button', { name: 'Create Deck' }).click();
	await page.fill('#input-modal', 'My Deck');
	const [createDeckResp] = await Promise.all([
		page.waitForResponse((r) => r.url().endsWith('/decks') && r.request().method() === 'POST'),
		page.getByRole('button', { name: 'Save' }).click(),
	]);
	expect(createDeckResp.ok()).toBeTruthy();
	const { deck } = await createDeckResp.json();
	const deckId = (deck?._id as string) || undefined;
	expect(deckId).toBeTruthy();
	await page.waitForURL(new RegExp(`/study/${deckId}/notation`));

	const [addResp] = await Promise.all([
		page.waitForResponse(
			(r) => r.url().includes(`/decks/${deckId}/cards`) && r.request().method() === 'POST',
		),
		page.getByRole('button', { name: 'Add Card' }).click(),
	]);
	expect(addResp.ok()).toBeTruthy();

	await page.goto(`/study/${deckId}`);
	const output = page.locator('#root');
	await output.waitFor();
	await expect(output).toHaveScreenshot('custom-deck-notation-to-study.png', screenshotOpts);
});

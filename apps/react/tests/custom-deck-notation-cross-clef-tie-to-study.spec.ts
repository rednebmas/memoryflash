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

const fmBass = [54];
const fmTreble = [66, 69, 73];
const aBass = [57];
const aTreble = [64, 69, 73];
const fm = [...fmBass, ...fmTreble];
const a = [...aBass, ...aTreble];
const notationEvents = [fmBass, fmTreble, fmBass, fmTreble, aBass, aTreble, aBass, aTreble];

test('Study cross-clef tied chord', async ({ page }) => {
	await initDeterministicEnv(page);
	await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');
	const courseId = await createCourse(page, 'My Test Course');
	const deckId = await createDeck(page, courseId, 'My Deck');
	await page.waitForURL(new RegExp(`/study/${deckId}/notation`));
	await page.getByLabel('Key').selectOption('E');
	await page.getByLabel('Count').fill('1');
	await page.getByRole('button', { name: 'h' }).click();
	await page.getByRole('button', { name: 'Bass' }).click();
	const root = page.locator('#root');
	await runRecorderEvents(page, undefined, notationEvents, undefined, async (index) => {
		if (index % 2 === 0) {
			await page.getByRole('button', { name: 'Treble' }).click();
			return;
		}
		const chord = (index + 1) / 2;
		await expect(root).toHaveScreenshot(
			`custom-deck-notation-cross-clef-tie-notation-input-${chord}.png`,
			screenshotOpts,
		);
		if (chord === 1) {
			await page.getByRole('button', { name: '8' }).click();
		} else if (chord === 2) {
			await page.getByRole('button', { name: 'q' }).click();
		} else if (chord === 3) {
			await page.getByRole('button', { name: '8' }).click();
		}
		if (index < notationEvents.length - 1) {
			await page.getByRole('button', { name: 'Bass' }).click();
		}
	});

	await page.getByRole('button', { name: 'Add Card' }).click();
	await page.goto(`/study/${deckId}`);
	await page.locator('.card-container').first().waitFor();
	await runRecorderEvents(page, undefined, [fm, a], 'custom-deck-notation-cross-clef-tie-study');
	const incorrect = await page.evaluate(
		() => (window as any).store.getState().scheduler.incorrect,
	);
	expect(incorrect).toBeFalsy();
	await page.unrouteAll({ behavior: 'ignoreErrors' });
});

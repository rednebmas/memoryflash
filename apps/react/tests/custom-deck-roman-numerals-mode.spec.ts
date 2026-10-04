import {
	test,
	expect,
	uiLogin,
	seedTestData,
	initDeterministicEnv,
	runRecorderEvents,
	setStaticScroll,
} from './helpers';
import { screenshotOpts } from './helpers/screenshotOptions';
import { samsNames, seedSoEasyDeck, soEasyEvents } from './helpers/soEasyDeck';

test('Sheet music card studied in Roman Numerals mode with corrected chord names', async ({
	page,
	clickButton,
}) => {
	await page.setViewportSize({ width: 1366, height: 992 });
	await initDeterministicEnv(page);
	await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');
	const { deckId, cId } = await seedSoEasyDeck(page, 'Roman Course');

	await page.goto(`/study/${deckId}/list`);
	await page.getByRole('button', { name: 'Card options' }).first().click();
	await page.getByRole('menuitem', { name: 'Edit card' }).click();
	await expect(page).toHaveURL(new RegExp(`/edit/${cId}`));
	for (const [i, name] of samsNames.entries()) {
		await page.getByLabel(`Chord ${i + 1} name`).fill(name);
	}
	await expect(
		page.getByText('Roman numerals: IV/V – Imaj7 – ♯i°7 – IV/V – V9 – Imaj7 – ♯i°7'),
	).toBeVisible();
	await setStaticScroll(page);
	await expect(page.locator('#root')).toHaveScreenshot(
		'roman-numerals-editor.png',
		screenshotOpts,
	);

	const patches = new Map<
		string,
		{ question: { voices: { stack: { chordName?: string }[] }[] } }
	>();
	page.on('request', (r) => {
		if (r.method() === 'PATCH' && r.url().includes('/cards/'))
			patches.set(r.url().split('/').pop()!, r.postDataJSON());
	});
	await clickButton('Update Card');
	await expect(page.getByText('Card updated')).toBeVisible();
	expect(patches.size).toBe(2);
	const bbPatch = [...patches.entries()].find(([id]) => id !== cId)![1];
	const bbNames = bbPatch.question.voices[0].stack.map((s) => s.chordName ?? '-');
	expect(bbNames.join(' ')).toBe('Eb/F Bbmaj7 Bdim7 Eb/F - F9 Bbmaj7 Bdim7');

	await page.goto(`/study/${deckId}`);
	await page.getByText('Roman Numerals', { exact: true }).click();
	await expect(page.getByText(/^Key of/).first()).toBeVisible();
	const isC = await page.evaluate((id) => {
		const store = (window as any).store;
		const card = store.getState().cards.entities[store.getState().scheduler.currCard];
		return card._id === id;
	}, cId);
	const events = soEasyEvents.map((notes) => notes.map((n) => (isC ? n : n + 10)));
	await runRecorderEvents(page, undefined, events.slice(0, 1), 'roman-numerals-study');
	await runRecorderEvents(page, undefined, events.slice(1));
	const incorrect = await page.evaluate(
		() => (window as any).store.getState().scheduler.incorrect,
	);
	expect(incorrect).toBeFalsy();

	await page.unrouteAll({ behavior: 'ignoreErrors' });
});

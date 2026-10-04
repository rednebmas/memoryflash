import { Page } from '@playwright/test';
import { Note } from 'tonal';
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
import { seedSoEasyDeck } from './helpers/soEasyDeck';

type Stack = { notes: { name: string; octave: number }[] }[];

const keyLabel = (page: Page, key: string) =>
	page.locator('label', { hasText: new RegExp(`^${key}$`) }).locator('input');

const currentCard = async (page: Page) => {
	const handle = await page.waitForFunction(() => {
		const state = (window as any).store.getState();
		const card = state.cards.entities[state.scheduler.currCard];
		return card && { id: card._id as string, stack: card.question.voices[0].stack as Stack };
	});
	return (await handle.jsonValue()) as { id: string; stack: Stack };
};

const playCurrentCard = async (page: Page) => {
	const { id, stack } = await currentCard(page);
	const events = stack
		.filter((s, i) => i !== 4)
		.map((s) => s.notes.map((n) => Note.midi(n.name + n.octave)!));
	await runRecorderEvents(page, undefined, events);
	return id;
};

const attemptMode = (page: Page, cardId: string) =>
	page.evaluate(
		(id) =>
			Object.values((window as any).store.getState().attempts.entities)
				.filter((a: any) => a.cardId === id)
				.pop() as { presentationMode: string; correct: boolean },
		cardId,
	);

test('Editing a card shows its existing transpositions and studies it in both display modes', async ({
	page,
	clickButton,
}) => {
	await page.setViewportSize({ width: 1366, height: 992 });
	await initDeterministicEnv(page);
	await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');
	const { deckId, cId } = await seedSoEasyDeck(page, 'Display Modes');

	await page.goto(`/study/${deckId}`);
	const { id: firstId } = await currentCard(page);
	const otherKey = firstId === cId ? 'Bb' : 'C';
	await page.getByRole('button', { name: 'Card options' }).first().click();
	await page.getByRole('menuitem', { name: 'Edit card' }).click();
	await expect(page).toHaveURL(new RegExp(`/edit/${firstId}`));

	await expect(page.getByText('1 key already in this deck')).toBeVisible();
	await page.getByRole('button', { name: /Transpositions/ }).click();
	await expect(keyLabel(page, otherKey)).toBeChecked();
	await expect(keyLabel(page, otherKey)).toBeDisabled();
	await page.getByLabel('Roman Numerals', { exact: true }).check();
	await keyLabel(page, 'G').check();
	await expect(page.getByText('Greyed-out ticked keys').locator('..')).toHaveScreenshot(
		'display-modes-transpositions.png',
		screenshotOpts,
	);
	await setStaticScroll(page);
	await expect(page.locator('#root')).toHaveScreenshot(
		'display-modes-editor.png',
		screenshotOpts,
	);

	const both = [{ id: 'Sheet Music' }, { id: 'Roman Numerals' }];
	const patches: { presentationModes: object[] }[] = [];
	page.on('request', (r) => {
		if (r.method() === 'PATCH' && r.url().includes('/cards/'))
			patches.push(r.postDataJSON().question);
	});
	const [added] = await Promise.all([
		page.waitForRequest((r) => r.url().endsWith(`/decks/${deckId}/cards`)),
		clickButton('Update Card'),
	]);
	await expect(page.getByText('Card updated')).toBeVisible();
	const addedQuestions = added.postDataJSON().questions;
	expect(addedQuestions.map((q: { key: string }) => q.key)).toEqual(['G']);
	expect(addedQuestions[0].presentationModes).toEqual(both);
	expect(patches.map((q) => q.presentationModes)).toEqual([both, both]);

	await page.goto(`/study/${deckId}/list`);
	await expect(page.locator('.card-container')).toHaveCount(3);
	await page.getByRole('button', { name: 'Card options' }).first().click();
	await page.getByRole('menuitem', { name: 'Edit card' }).click();
	await expect(page.getByText('2 keys already in this deck')).toBeVisible();
	await expect(page.getByLabel('Roman Numerals', { exact: true })).toBeChecked();
	await expect(page.getByLabel('Sheet Music', { exact: true })).toBeChecked();

	await page.goto(`/study/${deckId}`);
	await page.getByText('Roman Numerals', { exact: true }).click();
	await expect(page.getByText(/^Key of/).first()).toBeVisible();
	await expect(page.locator('#root')).toHaveScreenshot(
		'display-modes-study-roman.png',
		screenshotOpts,
	);
	const romanId = await playCurrentCard(page);
	expect(await attemptMode(page, romanId)).toMatchObject({
		presentationMode: 'Roman Numerals',
		correct: true,
	});

	await page.getByText('Sheet Music', { exact: true }).click();
	await expect(page.getByText(/^Key of/)).toHaveCount(0);
	await expect(page).toHaveScreenshot('display-modes-study-sheet.png', {
		...screenshotOpts,
		clip: { x: 40, y: 0, width: 1286, height: 992 },
	});
	const sheetId = await playCurrentCard(page);
	expect(await attemptMode(page, sheetId)).toMatchObject({
		presentationMode: 'Sheet Music',
		correct: true,
	});

	await page.unrouteAll({ behavior: 'ignoreErrors' });
});

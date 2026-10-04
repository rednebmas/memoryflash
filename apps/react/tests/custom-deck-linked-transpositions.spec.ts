import { Page, Request } from '@playwright/test';
import { Note } from 'tonal';
import {
	test,
	expect,
	uiLogin,
	seedTestData,
	initDeterministicEnv,
	runRecorderEvents,
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

const save = async (page: Page, clickButton: (name: string) => Promise<void>) => {
	const calls: { method: string; url: string; body: Record<string, unknown> }[] = [];
	const record = (r: Request) => {
		if (r.method() !== 'GET' && /\/cards|hidden-cards/.test(r.url()))
			calls.push({ method: r.method(), url: r.url(), body: r.postDataJSON() });
	};
	page.on('request', record);
	await clickButton('Update Card');
	await expect(page.getByText('Card updated')).toBeVisible();
	await page.waitForLoadState('networkidle');
	page.off('request', record);
	return calls;
};

test('Editing any card in a transposition group edits the whole group', async ({
	page,
	clickButton,
}) => {
	await page.setViewportSize({ width: 1366, height: 992 });
	await initDeterministicEnv(page);
	await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');
	const { deckId, cId } = await seedSoEasyDeck(page, 'Linked');

	await page.goto(`/study/${deckId}`);
	const { id: firstId } = await currentCard(page);
	const otherKey = firstId === cId ? 'Bb' : 'C';
	await page.getByRole('button', { name: 'Card options' }).first().click();
	await page.getByRole('menuitem', { name: 'Edit card' }).click();
	await expect(page.getByText('2 keys selected')).toBeVisible();
	await page.getByRole('button', { name: /Transpositions/ }).click();
	await expect(keyLabel(page, otherKey)).toBeChecked();
	await keyLabel(page, otherKey).uncheck();
	await keyLabel(page, 'G').check();
	await expect(page.getByText('Unticking a key hides').locator('..')).toHaveScreenshot(
		'linked-transpositions-picker.png',
		screenshotOpts,
	);

	const first = await save(page, clickButton);
	const added = first.find((c) => c.url.endsWith(`/decks/${deckId}/cards`))!.body;
	expect((added.questions as { key: string }[]).map((q) => q.key)).toEqual(['G']);
	expect(added.groups).toEqual(['so-easy']);
	const hidden = first.find((c) => c.url.endsWith('/hidden-cards'))!.body.hiddenCardIds;
	expect(first.filter((c) => c.method === 'PATCH' && c.url.includes('/cards/'))).toHaveLength(1);

	const gId = await page.evaluate(
		() =>
			(Object.values((window as any).store.getState().cards.entities) as any[]).find(
				(c) => c.question.key === 'G',
			)._id,
	);
	await page.goto(`/study/${deckId}/edit/${gId}`);
	await expect(page.getByText('2 keys selected')).toBeVisible();
	await page.getByRole('button', { name: /Transpositions/ }).click();
	await expect(keyLabel(page, otherKey)).not.toBeChecked();
	await keyLabel(page, otherKey).check();
	const second = await save(page, clickButton);
	expect(second.some((c) => c.method === 'POST')).toBe(false);
	expect(second.filter((c) => c.method === 'PATCH' && c.url.includes('/cards/'))).toHaveLength(3);
	const restored = second.find((c) => c.url.endsWith('/hidden-cards'))!.body.hiddenCardIds;
	expect([hidden, restored]).toEqual([[expect.any(String)], []]);

	await page.goto(`/study/${deckId}`);
	await expect(page.getByText('Sheet Music', { exact: true })).toBeVisible();
	await page.getByText('Roman Numerals', { exact: true }).click();
	await expect(page.getByText(/^Key of/).first()).toBeVisible();
	await expect(page).toHaveScreenshot('linked-transpositions-roman-chip.png', {
		...screenshotOpts,
		clip: { x: 40, y: 0, width: 1286, height: 992 },
	});
	const romanId = await playCurrentCard(page);
	expect(await attemptMode(page, romanId)).toMatchObject({
		presentationMode: 'Roman Numerals',
		correct: true,
	});

	await page.unrouteAll({ behavior: 'ignoreErrors' });
});

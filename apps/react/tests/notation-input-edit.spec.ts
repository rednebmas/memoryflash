import { test, expect, loadNotationInputScreen } from './helpers';

// verify edit mode shows Update Card button

test('NotationInputScreen edit flow', async ({ page }) => {
	await loadNotationInputScreen(page, { deckId: 'deck1', cardId: 'card1' });

	const cardPayload = {
		_id: 'card1',
		deckId: 'deck1',
		type: 'MultiSheet',
		question: { key: 'C', voices: [] },
		answer: { type: 'ExactMulti' },
	};

	await page.evaluate((c) => {
		(window as any).store.dispatch({ type: 'cards/upsert', payload: [c] });
	}, cardPayload);

	await expect(page.getByRole('button', { name: 'Update Card' })).toHaveText('Update Card');
	await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible();
});

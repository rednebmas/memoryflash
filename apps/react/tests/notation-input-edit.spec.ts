import { test, expect } from './helpers';

// verify edit mode shows Update Card button

test('NotationInputScreen edit flow', async ({ page }) => {
	await page.goto('/tests/notation-input-edit-test.html');
	await page.locator('#root').waitFor();

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

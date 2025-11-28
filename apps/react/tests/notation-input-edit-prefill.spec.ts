import { test, expect } from './helpers';

// ensure edit mode loads the existing question into previews

test('NotationInputScreen preloads existing card notation', async ({ page }) => {
	await page.goto('/tests/notation-input-edit-test.html');
	await page.locator('#root').waitFor();

	const cardPayload = {
		_id: 'card1',
		deckId: 'deck1',
		type: 'MultiSheet',
		question: {
			key: 'C',
			voices: [
				{
					staff: 'Treble',
					stack: [
						{ notes: [{ name: 'C', octave: 4 }], duration: 'q' },
						{ notes: [{ name: 'D', octave: 4 }], duration: 'q' },
						{ notes: [{ name: 'E', octave: 4 }], duration: 'q' },
						{ notes: [{ name: 'F', octave: 4 }], duration: 'q' },
					],
				},
			],
			presentationModes: [{ id: 'Sheet Music' }],
		},
		answer: { type: 'ExactMulti' },
	};

	await page.evaluate((c) => {
		(window as any).store.dispatch({ type: 'cards/upsert', payload: [c] });
	}, cardPayload);

	await expect(page.locator('[data-base-stack-length]')).toHaveAttribute(
		'data-base-stack-length',
		'4',
	);
});

import { expect, Page } from '@playwright/test';
import { screenshotOpts } from './screenshotOptions';

type MidiAction = 'midi/addNote' | 'midi/removeNote';

type StepHook = (index: number) => Promise<void> | void;

async function dispatchNotes(page: Page, action: MidiAction, notes: number[]) {
	if (notes.length === 0) return;
	await page.evaluate(
		(payload) => {
			const dispatch = (window as any).store.dispatch;
			for (const n of payload.notes) dispatch({ type: payload.action, payload: n });
		},
		{ action, notes },
	);
}

export async function runRecorderEvents(
	page: Page,
	url: string | undefined,
	events: number[][],
	prefix?: string,
	afterStep?: StepHook,
) {
	if (url) await page.goto(url);
	const output = page.locator('#root');
	await output.waitFor();

	for (let i = 0; i < events.length; i++) {
		const notes = events[i] ?? [];
		await dispatchNotes(page, 'midi/addNote', notes);
		await page.waitForTimeout(0);
		await dispatchNotes(page, 'midi/removeNote', notes);
		await output.waitFor();
		if (prefix && notes.length > 0)
			await expect(output).toHaveScreenshot(`${prefix}-${i + 1}.png`, screenshotOpts);
		if (afterStep) await afterStep(i);
	}

	return output;
}

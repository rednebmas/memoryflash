import { expect, Page } from '@playwright/test';

export async function seedTestData(page: Page) {
	const res = await page.request.post('http://localhost:3333/test/seed');
	expect(res.ok()).toBeTruthy();
	const json: any = await res.json();
	if (Array.isArray(json?.decks)) {
		json.decks = [...json.decks].sort((a, b) => {
			const an = (a?.name as string) || (a?.uid as string) || '';
			const bn = (b?.name as string) || (b?.uid as string) || '';
			return an < bn ? -1 : an > bn ? 1 : 0;
		});
	}
	return json;
}

export async function createCourse(page: Page, name: string) {
	await page.goto('/');
	await page.getByRole('button', { name: 'Create Course' }).click();
	await page.fill('#input-modal', name);
	const [response] = await Promise.all([
		page.waitForResponse(
			(r) => r.url().endsWith('/courses') && r.request().method() === 'POST',
		),
		page.getByRole('button', { name: 'Save' }).click(),
	]);
	expect(response.ok()).toBeTruthy();
	const { course } = await response.json();
	return course?._id as string;
}

export async function createDeck(page: Page, courseId: string, name: string) {
	await page.goto(`/course/${courseId}`);
	await page.getByRole('button', { name: 'Create Deck' }).click();
	await page.fill('#input-modal', name);
	const [response] = await Promise.all([
		page.waitForResponse((r) => r.url().endsWith('/decks') && r.request().method() === 'POST'),
		page.getByRole('button', { name: 'Save' }).click(),
	]);
	expect(response.ok()).toBeTruthy();
	const { deck } = await response.json();
	return deck?._id as string;
}

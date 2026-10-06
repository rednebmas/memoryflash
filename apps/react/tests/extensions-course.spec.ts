import { Page } from '@playwright/test';
import {
	test,
	expect,
	screenshotOpts,
	seedTestData,
	uiLogin,
	initDeterministicEnv,
} from './helpers';
import { API_URL } from './helpers/ports';

type Named = { _id: string; name: string; uid: string };

async function extensionsIds(page: Page) {
	const { courses } = await (await page.request.get(`${API_URL}/courses`)).json();
	const course = (courses as Named[]).find((c) => c.name === 'Extensions')!;
	const { decks } = await (await page.request.get(`${API_URL}/courses/${course._id}`)).json();
	const deck = (decks as Named[]).find((d) => d.uid === 'extensions 9 7 9 3')!;
	return { courseId: course._id, deckId: deck._id };
}

test('Extensions course shows seventh, ninth and rootless voicings', async ({ page }) => {
	await initDeterministicEnv(page);
	await seedTestData(page);
	await uiLogin(page, 't@example.com', 'Testing123!');
	const { courseId, deckId } = await extensionsIds(page);
	const output = page.locator('#root');

	await page.goto(`/course/${courseId}`);
	await page.getByText('Dominant 9th', { exact: true }).first().waitFor();
	await expect(output).toHaveScreenshot('extensions-course.png', screenshotOpts);

	await page.goto(`/study/${deckId}`);
	await expect(page.getByText(/Sheet Music w\/ Chords/)).toBeVisible();
	await expect(output).toHaveScreenshot('extensions-dominant-9th-study.png', screenshotOpts);
});

import { Page } from '@playwright/test';

export async function uiLogin(page: Page, email: string, password: string) {
	await page.goto('/auth/login');
	await page.fill('#email', email);
	await page.fill('#password', password);
	const [response] = await Promise.all([
		page.waitForResponse((r) => r.url().includes('/auth/log-in')),
		page.click('button:has-text("Login")'),
	]);
	if (response.status() !== 200) throw new Error(`Login failed: ${await response.text()}`);
	await page.waitForURL((url) => !url.toString().includes('/auth/login'), { timeout: 5000 });
}

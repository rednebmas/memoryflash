import * as fs from 'fs/promises';
import * as path from 'path';
import { Page } from 'playwright';
import {
	repoRoot,
	DEFAULT_SERVER_URL,
	DEFAULT_FRONT_END_URL,
	DEFAULT_EMAIL,
	DEFAULT_PASSWORD,
	DEFAULT_FIRST_NAME,
	DEFAULT_LAST_NAME,
} from './constants';

export async function login(page: Page): Promise<void> {
	const cookiePath =
		process.env.SESSION_COOKIES_PATH ||
		path.join(repoRoot, 'test-fixtures', 'session-cookies.json');
	try {
		const data = await fs.readFile(cookiePath, 'utf8');
		const cookies = JSON.parse(data);
		await page.context().addCookies(cookies);
		console.log('Loaded cookies from file');
		return;
	} catch {
		console.log('No cookies file, performing fresh login');
	}

	const serverUrl = process.env.SERVER_URL || DEFAULT_SERVER_URL;
	const frontEndUrl = process.env.FRONT_END_URL || process.env.APP_URL || DEFAULT_FRONT_END_URL;
	const email = process.env.TEST_EMAIL || DEFAULT_EMAIL;
	const password = process.env.TEST_PASSWORD || DEFAULT_PASSWORD;
	const firstName = process.env.TEST_FIRST_NAME || DEFAULT_FIRST_NAME;
	const lastName = process.env.TEST_LAST_NAME || DEFAULT_LAST_NAME;

	let res = await fetch(`${serverUrl}/auth/sign-up`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ firstName, lastName, email, password }),
	});
	console.log('Sign-up response', res.status);

	if (!res.ok) {
		res = await fetch(`${serverUrl}/auth/log-in`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email, password }),
		});
		console.log('Login response', res.status);
	}

	await page.goto(`${frontEndUrl}/auth/login`);
	await page.fill('#email', email);
	await page.fill('#password', password);
	await Promise.all([
		page.waitForURL((url) => !url.pathname.startsWith('/auth')),
		page.click('button[type="submit"]'),
	]);
	await page.waitForLoadState('networkidle');
	console.log('Login completed at', page.url());

	if (page.url().includes('/auth')) {
		console.log('Login did not navigate away; page HTML:', await page.content());
	}

	const cookies = await page.context().cookies();
	await fs.mkdir(path.dirname(cookiePath), { recursive: true });
	await fs.writeFile(cookiePath, JSON.stringify(cookies, null, 2));
	console.log('Authenticated via UI and saved cookies');
}

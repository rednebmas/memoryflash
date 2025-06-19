import * as fs from 'fs/promises';
import * as path from 'path';
import { Page } from 'playwright';

const repoRoot = path.resolve(__dirname, '..', '..');

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

        const serverUrl = process.env.SERVER_URL || 'http://localhost:3333';
        const domain = new URL(serverUrl).hostname;
        const email = process.env.TEST_EMAIL || 'sam@riker.tech';
        const password = process.env.TEST_PASSWORD || 'Testing1!';
        const firstName = process.env.TEST_FIRST_NAME || 'Sam';
        const lastName = process.env.TEST_LAST_NAME || 'Bender';

        let res = await fetch(`${serverUrl}/auth/sign-up`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email, password }),
        });

        if (!res.ok) {
                res = await fetch(`${serverUrl}/auth/log-in`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password }),
                });
        }

        if (!res.ok) {
                throw new Error(`Failed to authenticate user: ${res.status}`);
        }

        const setCookies = (res.headers as any).getSetCookie?.() || [];
        const sidCookie = setCookies.find((c: string) => c.startsWith('sid='));
        if (!sidCookie) {
                throw new Error('No session cookie in response');
        }
        const value = sidCookie.split(';')[0].split('=')[1];
        const cookie = {
                name: 'sid',
                value,
                domain,
                path: '/',
                httpOnly: true,
                secure: false,
        };
        await fs.mkdir(path.dirname(cookiePath), { recursive: true });
        await fs.writeFile(cookiePath, JSON.stringify([cookie], null, 2));
        await page.context().addCookies([cookie]);
        console.log('Authenticated and saved cookies');
}

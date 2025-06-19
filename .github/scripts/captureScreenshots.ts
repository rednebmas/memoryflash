import fs from 'fs/promises';
import path from 'path';
import { chromium } from 'playwright';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface BaseStep {
	wait?: number;
}

interface GotoStep extends BaseStep {
	action: 'goto';
	url: string;
}

interface ClickStep extends BaseStep {
	action: 'click';
	selector: string;
}

interface FillStep extends BaseStep {
	action: 'fill';
	selector: string;
	value?: string;
}

interface ScreenshotStep extends BaseStep {
        action: 'screenshot';
        name: string;
}

interface LoginStep extends BaseStep {
        action: 'login';
}

type Step = GotoStep | ClickStep | FillStep | ScreenshotStep | LoginStep;

async function loadCookies(page: any): Promise<void> {
	const cookiePath = process.env.SESSION_COOKIES_PATH || 'test-fixtures/session-cookies.json';
	try {
		console.log(`Loading cookies from ${cookiePath}`);
		const data = await fs.readFile(cookiePath, 'utf8');
		const cookies = JSON.parse(data);
		await page.context().addCookies(cookies);
		console.log('Cookies added');
	} catch {
		// ignore if file missing
	}
}

async function querySelectorFromLLM(html: string, desired: string): Promise<string | null> {
	if (!OPENAI_API_KEY) return null;
	try {
		const res = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${OPENAI_API_KEY}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				model: 'o4mini-high',
				messages: [
					{ role: 'system', content: 'Provide a CSS selector only.' },
					{
						role: 'user',
						content: `HTML:\n${html}\n\nFind a selector for element described as "${desired}"`,
					},
				],
			}),
		});
		const json = await res.json();
		const text = json.choices?.[0]?.message?.content?.trim();
		return text || null;
	} catch (err) {
		console.error('LLM error', err);
		return null;
	}
}

async function loadSteps(planPath: string): Promise<Step[]> {
	console.log(`Reading plan from ${planPath}`);
	const text = await fs.readFile(planPath, 'utf8');
	const match = text.match(/```json\s*([\s\S]*?)\s*```/);
	if (!match) {
		throw new Error('No JSON block found in plan');
	}
	const steps = JSON.parse(match[1]) as Step[];
	console.log('Loaded steps:', steps);
	return steps;
}

async function run(): Promise<void> {
	console.log('Starting screenshot capture');
	const steps = await loadSteps('ui-plan.md');
	const resultsDir = path.join('apps', 'react', 'test-results');
	await fs.mkdir(resultsDir, { recursive: true });

	console.log('Launching headless browser');
        const browser = await chromium.launch();
        const page = await browser.newPage();

	for (const step of steps) {
		console.log('Executing step', step);
		try {
                        if (step.action === 'goto') {
                                await page.goto(step.url);
                        } else if (step.action === 'click') {
                                await page.click(step.selector);
                        } else if (step.action === 'fill') {
                                await page.fill(step.selector, step.value ?? '');
                        } else if (step.action === 'login') {
                                await loadCookies(page);
                        } else if (step.action === 'screenshot') {
                                const screenshotPath = path.join(resultsDir, step.name);
                                console.log(`Capturing screenshot ${screenshotPath}`);
                                await page.screenshot({ path: screenshotPath });
			}
		} catch (err) {
			console.error('Error executing step', step, err);
			if (step.action === 'click') {
				const html = await page.content();
				const newSelector = await querySelectorFromLLM(html, step.selector);
				if (newSelector) {
					console.log(`LLM suggested selector: ${newSelector}`);
					await page.click(newSelector);
				} else {
					throw err;
				}
			} else {
				throw err;
			}
		}
		if (step.wait) {
			await page.waitForTimeout(step.wait);
		}
		console.log('Completed step', step.action);
	}

	await browser.close();
	console.log('Finished capturing screenshots');
}

run().catch((err) => {
	console.error(err);
	process.exit(1);
});

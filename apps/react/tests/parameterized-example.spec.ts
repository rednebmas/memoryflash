import { test, captureAndCompareScreenshot } from './helpers';

// Example of parameterized test cases as mentioned in the problem statement
const testCases = [
	{
		url: '/tests/music-notation-eighth-test.html',
		name: 'music-notation-eighth-parameterized.png',
	},
	{ url: '/tests/music-notation-rest-test.html', name: 'music-notation-rest-parameterized.png' },
	{
		url: '/tests/music-notation-half-quarter-test.html',
		name: 'music-notation-half-quarter-parameterized.png',
	},
];

test.describe('Music Notation Screenshots - Parameterized', () => {
	for (const { url, name } of testCases) {
		test(`Screenshot for ${name}`, async ({ page }) => {
			await captureAndCompareScreenshot(page, url, name);
		});
	}
});

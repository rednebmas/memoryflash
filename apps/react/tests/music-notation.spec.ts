import { test, expect } from '@playwright/test';

test('MusicNotation component screenshot', async ({ page }) => {
  await page.goto('/music-notation-test.html');
  const output = page.locator('#output');
  await output.waitFor();
  await expect(output).toHaveScreenshot('music-notation.png', {
    maxDiffPixelRatio: 0.02,
  });
});

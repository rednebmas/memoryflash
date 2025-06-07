import { test, expect } from '@playwright/test';

test('MusicRecorder component screenshot', async ({ page }) => {
        await page.goto('/music-recorder-test.html');
        await page.waitForTimeout(1000);
        await expect(page).toHaveScreenshot('music-recorder.png', {
                maxDiffPixelRatio: 0.02,
        });
});

# Screenshot Testing Utilities

This document describes the enhanced screenshot testing utilities available in `helpers.ts` that help reduce code duplication and improve maintainability of screenshot tests.

## Available Utilities

### `captureAndCompareScreenshot`

Enhanced version of the basic screenshot capture function that supports interactions and custom selectors.

```typescript
export async function captureAndCompareScreenshot(
	page: Page,
	url: string,
	name: string,
	selector = '#root',
	interactions: (() => Promise<void>)[] = [],
);
```

**Parameters:**

-   `page`: Playwright Page object
-   `url`: URL to navigate to
-   `name`: Screenshot filename
-   `selector`: CSS selector for the element to screenshot (default: '#root')
-   `interactions`: Array of async functions to execute before taking screenshot

**Example:**

```typescript
await captureAndCompareScreenshot(
	page,
	'/tests/music-recorder-chord-test.html',
	'my-test.png',
	'#root',
	[
		async () => await addMidiNotes(page, [60, 64, 67]),
		async () => await page.waitForTimeout(100),
	],
);
```

### `setupTest`

Abstract utility for handling common test setup tasks like error handling and environment configuration.

```typescript
export async function setupTest(page: Page, url: string, onError: (errors: string[]) => void);
```

**Parameters:**

-   `page`: Playwright Page object
-   `url`: URL to navigate to
-   `onError`: Callback function that receives collected errors

**Example:**

```typescript
let capturedErrors: string[] = [];

await setupTest(page, '/tests/my-test.html', (errors) => {
	capturedErrors = errors;
});

expect(capturedErrors).toEqual([]);
```

### `addMidiNotes`

Helper function for adding MIDI notes to music recorder tests.

```typescript
export async function addMidiNotes(page: Page, notes: number[]);
```

**Parameters:**

-   `page`: Playwright Page object
-   `notes`: Array of MIDI note numbers

**Example:**

```typescript
await addMidiNotes(page, [60, 64, 67]); // C major chord
await addMidiNotes(page, []); // Clear notes
```

### `updateRecorderDuration`

Helper function for updating recorder duration settings.

```typescript
export async function updateRecorderDuration(page: Page, duration: string, clef: string);
```

**Parameters:**

-   `page`: Playwright Page object
-   `duration`: Duration string (e.g., 'w' for whole, 'q' for quarter)
-   `clef`: Clef string (e.g., 'Bass', 'Treble')

**Example:**

```typescript
await updateRecorderDuration(page, 'w', 'Bass'); // Set bass clef to whole note
```

### `resetRecorderBeat`

Helper function for resetting the recorder beat position.

```typescript
export async function resetRecorderBeat(page: Page);
```

**Parameters:**

-   `page`: Playwright Page object

**Example:**

```typescript
await resetRecorderBeat(page); // Reset to beat 0
```

## Migration Examples

### Before (Original Pattern)

```typescript
test('MusicRecorder chord screenshot', async ({ page }) => {
	await page.goto('/tests/music-recorder-chord-test.html');
	const output = page.locator('#root');
	const events = [[60], [60, 64], [60, 64, 67], [], [65]];

	for (let i = 0; i < events.length; i++) {
		await page.evaluate((notes) => {
			(window as any).recorder.addMidiNotes(notes);
			(window as any).update();
		}, events[i]);
		await output.waitFor();
		await expect(output).toHaveScreenshot(`music-recorder-chord-${i + 1}.png`, screenshotOpts);
	}
});
```

### After (Using New Utilities)

```typescript
test('MusicRecorder chord screenshot', async ({ page }) => {
	const events = [[60], [60, 64], [60, 64, 67], [], [65]];

	for (let i = 0; i < events.length; i++) {
		await captureAndCompareScreenshot(
			page,
			'/tests/music-recorder-chord-test.html',
			`music-recorder-chord-${i + 1}.png`,
			'#root',
			[async () => await addMidiNotes(page, events[i])],
		);
	}
});
```

## Parameterized Test Pattern

For tests that follow similar patterns with different data:

```typescript
const testCases = [
	{ url: '/tests/music-notation-eighth-test.html', name: 'music-notation-eighth.png' },
	{ url: '/tests/music-notation-rest-test.html', name: 'music-notation-rest.png' },
];

test.describe('Music Notation Screenshots', () => {
	for (const { url, name } of testCases) {
		test(`Screenshot for ${name}`, async ({ page }) => {
			await captureAndCompareScreenshot(page, url, name);
		});
	}
});
```

## Error Handling Pattern

For tests that need to track JavaScript errors:

```typescript
test('Test with error handling', async ({ page }) => {
	let capturedErrors: string[] = [];

	await setupTest(page, '/tests/my-test.html', (errors) => {
		capturedErrors = errors;
	});

	// Your test logic here
	expect(capturedErrors).toEqual([]);

	await captureAndCompareScreenshot(page, '/tests/my-test.html', 'test.png');
});
```

## Benefits

1. **Reduced Duplication**: Common patterns are abstracted into reusable utilities
2. **Consistent Error Handling**: Standardized approach to tracking JavaScript errors
3. **Simplified Interactions**: MIDI interactions are abstracted into simple helper functions
4. **Better Maintainability**: Changes to screenshot logic only need to be made in one place
5. **Improved Readability**: Tests focus on what they're testing rather than how to test it

## Backward Compatibility

All existing utilities (`captureScreenshot`, `screenshotOpts`, `test`, `expect`) remain unchanged to ensure backward compatibility with existing tests.

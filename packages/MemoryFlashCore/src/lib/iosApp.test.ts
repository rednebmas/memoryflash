import { expect } from 'chai';
import { isIOSApp, isIOSDebug } from './iosApp';

const handler = { postMessage: () => {} };
const releaseApp = { webkit: { messageHandlers: { openSettings: handler } } };
const debugApp = { ...releaseApp, iosDebug: true };

describe('isIOSApp', () => {
	it('detects Release and Debug iOS app builds by their native settings handler', () => {
		expect(isIOSApp(releaseApp)).to.equal(true);
		expect(isIOSApp(debugApp)).to.equal(true);
	});

	it('is false in a regular browser, including Safari which has webkit but no app handlers', () => {
		expect(isIOSApp({})).to.equal(false);
		expect(isIOSApp({ webkit: { messageHandlers: {} } })).to.equal(false);
	});
});

describe('isIOSDebug', () => {
	it('is true only for Debug builds of the iOS app', () => {
		expect(isIOSDebug(debugApp)).to.equal(true);
		expect(isIOSDebug(releaseApp)).to.equal(false);
		expect(isIOSDebug({})).to.equal(false);
	});
});

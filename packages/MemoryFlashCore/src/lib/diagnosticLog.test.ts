import { expect } from 'chai';
import { createDiagnosticLog } from './diagnosticLog';

describe('createDiagnosticLog', () => {
	it('stamps entries with tag and seconds since load, keeping only the newest', () => {
		let now = 0;
		const diag = createDiagnosticLog(2, () => now);
		diag.log('audio', 'created');
		now = 1500;
		diag.log('audio', 'running');
		now = 2250;
		diag.log('metronome', 'start');
		expect(diag.entries()).to.deep.equal(['[audio +1.5s] running', '[metronome +2.3s] start']);
	});

	it('appends a live snapshot from each provider when read', () => {
		let now = 0;
		let clicks = 0;
		const diag = createDiagnosticLog(5, () => now);
		diag.snapshot('metronome', () => `clicks=${clicks}`);
		clicks = 4;
		now = 3000;
		expect(diag.entries()).to.deep.equal(['[metronome +3.0s] snapshot clicks=4']);
	});

	it('records a snapshot that throws instead of failing the read', () => {
		const diag = createDiagnosticLog(5, () => 0);
		diag.snapshot('audio', () => {
			throw new Error('boom');
		});
		expect(diag.entries()).to.deep.equal(['[audio +0.0s] snapshot failed: boom']);
	});
});

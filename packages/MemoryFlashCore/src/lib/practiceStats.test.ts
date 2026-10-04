import { expect } from 'chai';
import { practiceStatsLabel } from './practiceStats';

describe('practiceStatsLabel', () => {
	const now = new Date(2026, 9, 4, 9, 0);
	const at = (day: number, hour = 12) => new Date(2026, 9, day, hour).toISOString();
	const stats = (attempts: number, day: number, hour?: number) => ({
		attempts,
		lastAttemptedAt: at(day, hour),
		timeStudyingPerDay: {},
	});

	it('says when a card has never been practiced', () => {
		expect(practiceStatsLabel(undefined, now)).to.equal('Not practiced yet');
	});

	it('counts attempts and says when it was practiced today', () => {
		expect(practiceStatsLabel(stats(12, 4, 1), now)).to.equal('12 attempts · practiced today');
	});

	it('uses calendar days, not 24h windows', () => {
		expect(practiceStatsLabel(stats(1, 3, 23), now)).to.equal(
			'1 attempt · practiced yesterday',
		);
		expect(practiceStatsLabel(stats(2, 1), now)).to.equal('2 attempts · practiced 3 days ago');
	});
});

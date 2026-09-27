import { expect } from 'chai';
import { stepLadder, TempoLadder } from './tempoLadder';

const play = (results: boolean[], start = 80, ladder?: TempoLadder) =>
	results.reduce<TempoLadder | undefined>(
		(l, correct) => stepLadder(l, start, { bpm: l?.bpm ?? start, correct }),
		ladder,
	)!;

describe('stepLadder', () => {
	it('rises after 7 of the last 8 cards are clean', () => {
		const ladder = play([true, true, false, true, true, true, true, true]);
		expect(ladder).to.deep.equal({ startBpm: 80, bpm: 85, recent: [] });
	});

	it('holds while the window is not yet full', () => {
		expect(play(Array(7).fill(true)).bpm).to.equal(80);
	});

	it('drops after 4 misses in the window but never below the start tempo', () => {
		const risen = play(Array(8).fill(true));
		expect(play([false, true, false, false, false], 80, risen).bpm).to.equal(80);
		expect(play([false, false, false, false]).bpm).to.equal(80);
	});

	it('uses a rolling window so one bad card does not reset progress', () => {
		const ladder = play([false, true, true, true, true, true, true, true, true]);
		expect(ladder.bpm).to.equal(85);
	});

	it('ignores attempts played at a different tempo', () => {
		const ladder = stepLadder(undefined, 80, { bpm: 100, correct: true });
		expect(ladder).to.deep.equal({ startBpm: 80, bpm: 80, recent: [] });
	});

	it('restarts from a new start tempo', () => {
		const risen = play(Array(8).fill(true));
		const ladder = stepLadder(risen, 60, { bpm: 60, correct: true });
		expect(ladder).to.deep.equal({ startBpm: 60, bpm: 60, recent: [true] });
	});
});

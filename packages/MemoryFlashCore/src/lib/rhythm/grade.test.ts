import { expect } from 'chai';
import { chordOnset, isRollTooSlow, snapAnchor, tierFor } from './grade';
import { calibrationOffsetMs } from './calibrate';

const grid = { originMs: 1000, beatMs: 500 };

describe('snapAnchor', () => {
	it('snaps to the nearest click on either side', () => {
		expect(snapAnchor(1480, grid)).to.equal(1500);
		expect(snapAnchor(1520, grid)).to.equal(1500);
		expect(snapAnchor(1740, grid)).to.equal(1500);
	});

	it('rounds a halfway onset to the later click', () => {
		expect(snapAnchor(1750, grid)).to.equal(2000);
	});

	it('handles onsets before the origin', () => {
		expect(snapAnchor(620, grid)).to.equal(500);
	});
});

describe('tierFor', () => {
	it('uses inclusive limits for normal strictness', () => {
		expect(tierFor(35, 'normal')).to.equal('perfect');
		expect(tierFor(-36, 'normal')).to.equal('good');
		expect(tierFor(70, 'normal')).to.equal('good');
		expect(tierFor(120, 'normal')).to.equal('ok');
		expect(tierFor(-121, 'normal')).to.equal('miss');
	});

	it('is stricter for tight and looser for loose', () => {
		expect(tierFor(90, 'tight')).to.equal('miss');
		expect(tierFor(170, 'loose')).to.equal('ok');
	});
});

describe('chordOnset', () => {
	const roll = [
		{ number: 60, time: 1000 },
		{ number: 64, time: 1060 },
		{ number: 67, time: 1120 },
	];

	it('uses the first note of a roll as the onset', () => {
		expect(chordOnset(roll, 0)).to.deep.equal({ onsetMs: 1000, spreadMs: 120 });
		expect(isRollTooSlow(120)).to.equal(false);
	});

	it('ignores notes held from before the previous step', () => {
		const held = [{ number: 55, time: 400 }, ...roll];
		expect(chordOnset(held, 500)?.onsetMs).to.equal(1000);
	});

	it('flags a slow roll', () => {
		expect(isRollTooSlow(200)).to.equal(true);
	});

	it('returns null when nothing new was played', () => {
		expect(chordOnset(roll, 2000)).to.equal(null);
	});
});

describe('calibrationOffsetMs', () => {
	it('returns the median tap offset and ignores an outlier', () => {
		const clicks = [0, 500, 1000, 1500, 2000];
		const taps = [40, 545, 1038, 1542, 2230];
		expect(calibrationOffsetMs(clicks, taps)).to.equal(42);
	});

	it('returns null without taps', () => {
		expect(calibrationOffsetMs([0, 500], [])).to.equal(null);
	});
});

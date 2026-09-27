import { expect } from 'chai';
import { StaffEnum } from '../../types/Cards';
import { StackedNotes } from '../../types/MultiSheetCard';
import { chromaMatch, findAnchorOnset, gradeCoverage, noteWindows } from './coverage';
import { PitchFrame } from './types';

const FRAME = 1000 / 60;
const question = (stack: StackedNotes[]) => ({
	key: 'C',
	voices: [{ staff: StaffEnum.Treble, stack }],
});
const q = (name: string, duration: StackedNotes['duration'] = 'q'): StackedNotes => ({
	notes: [{ name, octave: 4 }],
	duration,
});

const framesOf = (spans: { from: number; to: number; midi?: number }[]): PitchFrame[] => {
	const end = Math.max(...spans.map((s) => s.to));
	const frames: PitchFrame[] = [];
	for (let t = 0; t < end; t += FRAME) {
		const span = spans.find((s) => t >= s.from && t < s.to);
		frames.push({ timeMs: t, midi: span?.midi });
	}
	return frames;
};

const grid = { anchorMs: 0, beat0: 0, beatMs: 500 };

describe('noteWindows', () => {
	it('builds one window per note on the grid, skipping rests and merging ties', () => {
		const tied = { ...q('D'), tie: { toNext: [0] } };
		const windows = noteWindows(
			question([
				q('C'),
				{ notes: [], duration: 'q', rest: true },
				tied,
				{ ...q('D'), tie: { fromPrevious: [0] } },
			]),
			grid,
		);
		expect(windows.map((w) => [w.startMs, w.endMs, w.midis[0]])).to.deep.equal([
			[0, 500, 60],
			[1000, 2000, 62],
		]);
	});
});

describe('gradeCoverage', () => {
	const window = { index: 0, startMs: 0, endMs: 500, midis: [60] };

	it('passes a fully held note', () => {
		const grade = gradeCoverage(framesOf([{ from: 0, to: 500, midi: 60 }]), window);
		expect(grade.tier).to.equal('perfect');
		expect(grade.offsetMs).to.equal(0);
	});

	it('gives ok when 20% late and misses when 30% late', () => {
		expect(gradeCoverage(framesOf([{ from: 100, to: 500, midi: 60 }]), window).tier).to.equal(
			'ok',
		);
		const late = gradeCoverage(framesOf([{ from: 150, to: 500, midi: 60 }]), window);
		expect(late.tier).to.equal('miss');
		expect(late.offsetMs).to.be.closeTo(150, FRAME);
	});

	it('misses a note cut short or played at the wrong pitch', () => {
		expect(
			gradeCoverage(
				framesOf([
					{ from: 0, to: 300, midi: 60 },
					{ from: 300, to: 500 },
				]),
				window,
			).tier,
		).to.equal('miss');
		expect(gradeCoverage(framesOf([{ from: 0, to: 500, midi: 62 }]), window).tier).to.equal(
			'miss',
		);
	});

	it('passes repeated notes sustained without a break', () => {
		const frames = framesOf([{ from: 0, to: 1000, midi: 60 }]);
		const second = { index: 1, startMs: 500, endMs: 1000, midis: [60] };
		expect(gradeCoverage(frames, window).tier).to.equal('perfect');
		expect(gradeCoverage(frames, second).tier).to.equal('perfect');
	});

	it('accepts any octave with chroma matching', () => {
		const frames = framesOf([{ from: 0, to: 500, midi: 72 }]);
		expect(gradeCoverage(frames, window, chromaMatch).tier).to.equal('perfect');
	});
});

describe('findAnchorOnset', () => {
	it('returns the start of the first stable run of the expected pitch', () => {
		const frames = framesOf([
			{ from: 0, to: 40, midi: 62 },
			{ from: 100, to: 120, midi: 60 },
			{ from: 300, to: 800, midi: 60 },
		]);
		expect(findAnchorOnset(frames, [60])).to.be.closeTo(300, FRAME);
	});

	it('returns undefined before the note is played', () => {
		expect(findAnchorOnset(framesOf([{ from: 0, to: 500, midi: 62 }]), [60])).to.equal(
			undefined,
		);
	});
});

import { expect } from 'chai';
import { quantizeToBars, RecordedNote } from './quantize';
import { spellBeats } from './spellDurations';

const BEAT = 500;
const opts = (beatsPerBar = 4, stepsPerBeat = 2) => ({
	originMs: 0,
	beatMs: BEAT,
	beatsPerBar,
	stepsPerBeat,
	key: 'C',
});
const at = (midi: number, beat: number, beats: number, jitter = 0): RecordedNote => ({
	midi,
	onMs: beat * BEAT + jitter,
	offMs: (beat + beats) * BEAT - 20,
});
const summary = (bars: ReturnType<typeof quantizeToBars>) =>
	bars.map((bar) =>
		bar.map((s) =>
			s.rest
				? `r${s.duration}`
				: `${s.notes.map((n) => n.name).join('')}${s.duration}${s.tie?.toNext ? '~' : ''}`,
		),
	);

describe('spellBeats', () => {
	it('uses dotted values where they fit', () => {
		expect(spellBeats(3)).to.deep.equal(['hd']);
		expect(spellBeats(2.5)).to.deep.equal(['h', '8']);
		expect(spellBeats(1.75)).to.deep.equal(['qd', '16']);
	});
});

describe('quantizeToBars', () => {
	it('snaps sloppy quarter notes to the grid', () => {
		const notes = [at(60, 0, 1, 40), at(62, 1, 1, -60), at(64, 2, 1, 30), at(65, 3, 1)];
		expect(summary(quantizeToBars(notes, opts()))).to.deep.equal([['Cq', 'Dq', 'Eq', 'Fq']]);
	});

	it('fills gaps with rests and pads the last bar', () => {
		const notes = [at(60, 0, 1), at(64, 2, 0.5)];
		expect(summary(quantizeToBars(notes, opts()))).to.deep.equal([
			['Cq', 'rq', 'E8', 'r8', 'rq'],
		]);
	});

	it('ties a note across the bar line in 3/4', () => {
		const notes = [at(67, 2, 2), at(65, 4, 2)];
		expect(summary(quantizeToBars(notes, opts(3)))).to.deep.equal([
			['rh', 'Gq~'],
			['Gq', 'Fh'],
		]);
	});

	it('starts bar 1 at the downbeat before the first note', () => {
		const notes = [at(60, 5, 1), at(62, 6, 2)];
		expect(summary(quantizeToBars(notes, opts()))).to.deep.equal([['rq', 'Cq', 'Dh']]);
	});

	it('cuts legato overlaps at the next note and groups chords', () => {
		const notes = [at(60, 0, 1.5), at(64, 0, 1.5), at(67, 1, 3)];
		expect(summary(quantizeToBars(notes, opts()))).to.deep.equal([['CEq', 'Ghd']]);
	});

	it('quantizes to sixteenths', () => {
		const notes = [at(60, 0, 0.25), at(62, 0.25, 0.75), at(64, 1, 3)];
		expect(summary(quantizeToBars(notes, opts(4, 4)))).to.deep.equal([['C16', 'D8d', 'Ehd']]);
	});

	it('keeps leading rests when punching in from a fixed bar', () => {
		const notes = [at(60, 5, 1)];
		const bars = quantizeToBars(notes, { ...opts(), firstBar: 0 });
		expect(summary(bars)).to.deep.equal([['rw'], ['rq', 'Cq', 'rh']]);
	});
});

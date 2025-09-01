import { expect } from 'chai';
import { MusicRecorder } from './MusicRecorder';
import { StaffEnum } from '../types/Cards';

describe('MusicRecorder', () => {
	it('converts midi numbers to sheet notes', () => {
		const r = new MusicRecorder('q');
		r.addMidiNotes([60, 64]);
		r.addMidiNotes([]);
		expect(r.notes).to.deep.equal([
			{
				notes: [
					{ name: 'C', octave: 4 },
					{ name: 'E', octave: 4 },
				],
				duration: 'q',
			},
		]);
	});

	it('returns whole rest when empty', () => {
		const r = new MusicRecorder('q');
		expect(r.filledNotes).to.deep.equal([{ notes: [], duration: 'w', rest: true }]);
	});

	it('ignores notes beyond one measure', () => {
		const r = new MusicRecorder('q');
		for (const n of [60, 62, 64, 65, 67]) {
			r.addMidiNotes([n]);
			r.addMidiNotes([]); // release
		}
		expect(r.notes.length).to.equal(4);
	});

	it('ignores cross-clef notes after one bar', () => {
		const r = new MusicRecorder('q');
		for (const n of [60, 48, 60, 48, 60]) {
			r.addMidiNotes([n]);
			r.addMidiNotes([]);
		}
		expect(r.notes.length).to.equal(4);
		expect(r.totalBeatsRecorded).to.equal(4);
	});

	it('records two measures when configured', () => {
		const r = new MusicRecorder('q', 'C4', 'q', 2);
		for (const n of [60, 62, 64, 65, 67, 69, 71, 72]) {
			r.addMidiNotes([n]);
			r.addMidiNotes([]);
		}
		expect(r.notes.length).to.equal(8);
	});

	it('ignores notes beyond two measures', () => {
		const r = new MusicRecorder('q', 'C4', 'q', 2);
		for (const n of [60, 62, 64, 65, 67, 69, 71, 72, 74]) {
			r.addMidiNotes([n]);
			r.addMidiNotes([]);
		}
		expect(r.notes.length).to.equal(8);
	});

	it('records notes on press and starts a new stack after release', () => {
		const r = new MusicRecorder('q');
		r.addMidiNotes([60]);
		r.addMidiNotes([60, 64]);
		r.addMidiNotes([64]);
		r.addMidiNotes([]);
		r.addMidiNotes([65]);
		r.addMidiNotes([]);
		expect(r.notes).to.deep.equal([
			{
				notes: [
					{ name: 'C', octave: 4 },
					{ name: 'E', octave: 4 },
				],
				duration: 'q',
			},
			{
				notes: [{ name: 'F', octave: 4 }],
				duration: 'q',
			},
		]);
	});

	it('stacks additional notes until released', () => {
		const r = new MusicRecorder('q');
		r.addMidiNotes([60]);
		r.addMidiNotes([60, 64]);
		r.addMidiNotes([60, 64, 67]);
		r.addMidiNotes([]);
		expect(r.notes).to.deep.equal([
			{
				notes: [
					{ name: 'C', octave: 4 },
					{ name: 'E', octave: 4 },
					{ name: 'G', octave: 4 },
				],
				duration: 'q',
			},
		]);
	});

	it('adds rests to the opposite clef when alternating notes', () => {
		const r = new MusicRecorder('q');
		r.addMidiNotes([60]);
		r.addMidiNotes([]);
		r.addMidiNotes([48]);
		r.addMidiNotes([]);
		r.addMidiNotes([60]);
		r.addMidiNotes([]);
		r.addMidiNotes([48]);
		r.addMidiNotes([]);

		const q = r.buildQuestion('C');
		const treble = q.voices.find((v) => v.staff === StaffEnum.Treble)!.stack;
		const bass = q.voices.find((v) => v.staff === StaffEnum.Bass)!.stack;

		expect(treble.map((n) => n.rest || false)).to.deep.equal([false, true, false, true]);
		expect(bass.map((n) => n.rest || false)).to.deep.equal([true, false, true, false]);
	});

	it('tracks durations separately per clef', () => {
		const r = new MusicRecorder('q');
		r.updateDuration('q', StaffEnum.Treble);
		r.updateDuration('h', StaffEnum.Bass);
		r.addMidiNotes([60]);
		r.addMidiNotes([]);
		r.addMidiNotes([48]);
		r.addMidiNotes([]);

		const q = r.buildQuestion('C');
		const treble = q.voices.find((v) => v.staff === StaffEnum.Treble)!.stack;
		const bass = q.voices.find((v) => v.staff === StaffEnum.Bass)!.stack;

		expect(treble[0].duration).to.equal('q');
		expect(bass.find((n) => !n.rest)!.duration).to.equal('h');
	});

	it('records chords across clefs on key press', () => {
		const r = new MusicRecorder('q');
		r.addMidiNotes([48]);
		r.addMidiNotes([48, 60]);
		expect(r.notes).to.deep.equal([
			{
				notes: [
					{ name: 'C', octave: 4 },
					{ name: 'C', octave: 3 },
				],
				duration: 'q',
			},
		]);
		r.addMidiNotes([]);
	});

	it('exposes totalBeatsRecorded and hasFullMeasure helpers', () => {
		const r = new MusicRecorder('q');
		expect(r.totalBeatsRecorded).to.equal(0);
		expect(r.hasFullMeasure()).to.equal(false);
		for (const n of [60, 62, 64, 65]) {
			r.addMidiNotes([n]);
			r.addMidiNotes([]);
		}
		expect(r.totalBeatsRecorded).to.equal(4);
		expect(r.hasFullMeasure()).to.equal(true);
	});
});

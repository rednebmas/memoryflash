import { expect } from 'chai';
import { MusicRecorder } from './MusicRecorder';
import { StaffEnum } from '../types/Cards';

describe('MusicRecorder', () => {
	it('converts midi numbers to sheet notes', () => {
		const r = new MusicRecorder('q');
		r.addMidiNotes([60, 64]);
		r.addMidiNotes([]);
		const q = r.buildQuestion('C');
		const treble = q.voices[0].stack[0];
		expect(treble).to.deep.include({ duration: 'q' });
		expect(treble.notes).to.deep.equal([
			{ name: 'C', octave: 4 },
			{ name: 'E', octave: 4 },
		]);
	});

	it('removes last note', () => {
		const r = new MusicRecorder('q');
		r.addMidiNotes([60]);
		r.addMidiNotes([]);
		r.removeLast();
		const q = r.buildQuestion('C');
		expect(q.voices[0].stack).to.deep.equal([{ notes: [], duration: 'w', rest: true }]);
	});

	it('returns whole rest when empty', () => {
		const r = new MusicRecorder('q', 'q');
		const q = r.buildQuestion('C');
		expect(q.voices[0].stack).to.deep.equal([{ notes: [], duration: 'w', rest: true }]);
	});

	it('ignores notes beyond one measure', () => {
		const r = new MusicRecorder('q');
		for (const n of [60, 62, 64, 65, 67]) {
			r.addMidiNotes([n]);
			r.addMidiNotes([]);
		}
		const q = r.buildQuestion('C');
		const treble = q.voices[0].stack.filter((n) => !n.rest);
		expect(treble.length).to.equal(4);
	});

	it('records new stack only after notes released', () => {
		const r = new MusicRecorder('q');
		r.addMidiNotes([60]);
		r.addMidiNotes([60, 64]);
		r.addMidiNotes([64]);
		r.addMidiNotes([]);
		r.addMidiNotes([65]);
		r.addMidiNotes([]);
		const q = r.buildQuestion('C');
		const treble = q.voices[0].stack.filter((n) => !n.rest);
		expect(treble[0].notes).to.deep.equal([
			{ name: 'C', octave: 4 },
			{ name: 'E', octave: 4 },
		]);
		expect(treble[1].notes).to.deep.equal([{ name: 'F', octave: 4 }]);
	});

	it('stacks additional notes until released', () => {
		const r = new MusicRecorder('q');
		r.addMidiNotes([60]);
		r.addMidiNotes([60, 64]);
		r.addMidiNotes([60, 64, 67]);
		r.addMidiNotes([]);
		const q = r.buildQuestion('C');
		const treble = q.voices[0].stack.filter((n) => !n.rest)[0];
		expect(treble.notes).to.deep.equal([
			{ name: 'C', octave: 4 },
			{ name: 'E', octave: 4 },
			{ name: 'G', octave: 4 },
		]);
	});

	it('adds notes independently when alternating clefs', () => {
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

		expect(treble.map((n) => n.rest || false)).to.deep.equal([false, false, true]);
		expect(bass.map((n) => n.rest || false)).to.deep.equal([false, false, true]);
	});

	it('handles bass whole and treble quarters', () => {
		const r = new MusicRecorder('q', 'w');
		r.updateDuration('w', StaffEnum.Bass);
		r.addMidiNotes([36]);
		r.addMidiNotes([]);
		r.updateDuration('q', StaffEnum.Treble);
		for (const m of [60, 62, 64, 65]) {
			r.addMidiNotes([m]);
			r.addMidiNotes([]);
		}
		const q = r.buildQuestion('C');
		const treble = q.voices.find((v) => v.staff === StaffEnum.Treble)!.stack;
		const bass = q.voices.find((v) => v.staff === StaffEnum.Bass)!.stack;
		expect(treble.map((n) => n.duration)).to.deep.equal(['q', 'q', 'q', 'q']);
		expect(bass.map((n) => n.duration)).to.deep.equal(['w']);
	});

	it('handles rests with independent cursors', () => {
		const r = new MusicRecorder('q', 'w');
		r.updateDuration('w', StaffEnum.Bass);
		r.addMidiNotes([36]);
		r.addMidiNotes([]);
		r.updateDuration('8', StaffEnum.Treble);
		r.addRest(StaffEnum.Treble);
		r.addMidiNotes([60]);
		r.addMidiNotes([]);
		r.updateDuration('q', StaffEnum.Treble);
		for (const m of [62, 64, 65]) {
			r.addMidiNotes([m]);
			r.addMidiNotes([]);
		}
		const q = r.buildQuestion('C');
		const treble = q.voices.find((v) => v.staff === StaffEnum.Treble)!.stack;
		expect(treble.map((n) => ({ dur: n.duration, rest: !!n.rest })).slice(0, 5)).to.deep.equal([
			{ dur: '8', rest: true },
			{ dur: '8', rest: false },
			{ dur: 'q', rest: false },
			{ dur: 'q', rest: false },
			{ dur: 'q', rest: false },
		]);
	});
});

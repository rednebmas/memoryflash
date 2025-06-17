import { expect } from 'chai';
import { MusicRecorder } from './MusicRecorder';

describe('MusicRecorder', () => {
	it('converts midi numbers to sheet notes', () => {
		const r = new MusicRecorder('q');
		r.addMidiNotes([60, 64]);
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

	it('tracks newly added notes only', () => {
		const r = new MusicRecorder('q');
		r.addMidiNotes([60]);
		r.addMidiNotes([60, 62]);
		expect(r.notes[1]).to.deep.equal({ notes: [{ name: 'D', octave: 4 }], duration: 'q' });
	});

	it('removes last note', () => {
		const r = new MusicRecorder('q');
		r.addMidiNotes([60]);
		r.removeLast();
		expect(r.notes).to.deep.equal([]);
	});

	it('returns whole rest when empty', () => {
		const r = new MusicRecorder('q');
		expect(r.filledNotes).to.deep.equal([{ notes: [], duration: 'w', rest: true }]);
	});

	it('ignores notes beyond one measure', () => {
		const r = new MusicRecorder('q');
		for (const n of [60, 62, 64, 65, 67]) {
			r.addMidiNotes([n]);
		}
		expect(r.notes.length).to.equal(4);
	});
});

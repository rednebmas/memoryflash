import { expect } from 'chai';
import { buildScoreTimeline, activeNotesAt } from './scoreTimeline';
import { MultiSheetQuestion } from '../types/MultiSheetCard';
import { StaffEnum } from '../types/Cards';
import { Note } from 'tonal';

const makeQuestion = (
	stack: MultiSheetQuestion['voices'][number]['stack'],
): MultiSheetQuestion => ({
	key: 'C',
	voices: [
		{
			staff: StaffEnum.Treble,
			stack,
		},
	],
});

describe('buildScoreTimeline', () => {
	it('merges events for fully tied notes', () => {
		const question = makeQuestion([
			{
				notes: [{ name: 'C', octave: 4 }],
				duration: 'q',
				tie: { toNext: [0] },
			},
			{
				notes: [{ name: 'C', octave: 4 }],
				duration: 'q',
				tie: { fromPrevious: [0] },
			},
		]);
		const timeline = buildScoreTimeline(question);
		expect(timeline.events).to.have.length(1);
		expect(timeline.events[0].start).to.equal(0);
		expect(timeline.events[0].end).to.equal(2);
		expect(timeline.beats).to.deep.equal([0, 2]);
		expect(activeNotesAt(timeline, 0)).to.have.length(1);
	});

	it('merges only the tied portions of chords', () => {
		const question = makeQuestion([
			{
				notes: [
					{ name: 'C', octave: 4 },
					{ name: 'E', octave: 4 },
				],
				duration: 'q',
				tie: { toNext: [0] },
			},
			{
				notes: [
					{ name: 'C', octave: 4 },
					{ name: 'G', octave: 4 },
				],
				duration: 'q',
				tie: { fromPrevious: [0] },
			},
		]);
		const timeline = buildScoreTimeline(question);
		expect(timeline.events).to.have.length(3);
		const cMidi = Note.midi('C4');
		const eMidi = Note.midi('E4');
		const gMidi = Note.midi('G4');
		if (cMidi === null || eMidi === null || gMidi === null)
			throw new Error('Unexpected midi value');
		const cEvent = timeline.events.find((e) => e.midi === cMidi);
		const eEvent = timeline.events.find((e) => e.midi === eMidi);
		const gEvent = timeline.events.find((e) => e.midi === gMidi);
		expect(cEvent?.start).to.equal(0);
		expect(cEvent?.end).to.equal(2);
		expect(eEvent?.start).to.equal(0);
		expect(eEvent?.end).to.equal(1);
		expect(gEvent?.start).to.equal(1);
		expect(gEvent?.end).to.equal(2);
		expect(timeline.beats).to.deep.equal([0, 1, 2]);
	});
});

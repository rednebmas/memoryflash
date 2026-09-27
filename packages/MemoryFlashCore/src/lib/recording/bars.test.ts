import { expect } from 'chai';
import { StaffEnum } from '../../types/Cards';
import { StackedNotes } from '../../types/MultiSheetCard';
import {
	barsToQuestion,
	deleteBar,
	insertBar,
	normalizeTies,
	replaceBars,
	segmentQuestion,
} from './bars';

const n = (name: string, duration: StackedNotes['duration'], tie?: StackedNotes['tie']) => ({
	notes: [{ name, octave: 4 }],
	duration,
	...(tie && { tie }),
});
const bar = (name: string) => [n(name, 'hd')];

describe('bar editing', () => {
	const bars = [bar('C'), bar('D'), bar('E')];

	it('punches a take in over existing bars', () => {
		const result = replaceBars(bars, 1, [bar('F'), bar('G'), bar('A')]);
		expect(result.map((b) => b[0].notes[0].name)).to.deep.equal(['C', 'F', 'G', 'A']);
	});

	it('inserts and deletes bars', () => {
		const inserted = insertBar(bars, 1, 3);
		expect(inserted[1][0].rest).to.equal(true);
		expect(deleteBar(inserted, 1)).to.deep.equal(bars);
	});

	it('drops dangling ties', () => {
		const stack = [
			n('C', 'q', { toNext: [0] }),
			{ notes: [], duration: 'q' as const, rest: true },
		];
		expect(normalizeTies(stack)[0]).to.not.have.property('tie');
	});

	it('builds a 3/4 question and fills empty bars with rests', () => {
		const question = barsToQuestion([bar('C'), []], 'C', 3);
		expect(question.beatsPerBar).to.equal(3);
		expect(question.voices[0].stack.map((s) => s.duration)).to.deep.equal(['hd', 'h', 'q']);
	});
});

describe('segmentQuestion', () => {
	const question = {
		key: 'C',
		beatsPerBar: 3,
		voices: [
			{
				staff: StaffEnum.Treble,
				stack: [
					...bar('C'),
					n('D', 'h'),
					n('E', 'q', { toNext: [0] }),
					n('E', 'hd', { fromPrevious: [0] }),
					{ notes: [], duration: 'hd' as const, rest: true },
					...bar('G'),
				],
			},
		],
	};

	it('splits into consecutive segments, cutting ties at the edges', () => {
		const twos = segmentQuestion(question, 2);
		expect(twos).to.have.length(3);
		expect(twos[0].voices[0].stack.at(-1)).to.not.have.property('tie');
		expect(twos[1].voices[0].stack[0]).to.not.have.property('tie');
		expect(twos[0].beatsPerBar).to.equal(3);
	});

	it('drops segments that are only rests', () => {
		expect(segmentQuestion(question, 1)).to.have.length(4);
	});
});

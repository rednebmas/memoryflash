import { expect } from 'chai';
import { AiPassage, AiStackItem, barProblems, passageToQuestion } from './aiSheetCards';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';

const note = (pitch: string, duration: AiStackItem['duration'], extra = {}): AiStackItem => ({
	notes: [{ name: pitch.slice(0, -1), octave: Number(pitch.slice(-1)) }],
	duration,
	rest: false,
	tieToNext: false,
	chordName: '',
	...extra,
});

export const twoBars: AiStackItem[] = [
	note('C5', 'q', { chordName: 'F' }),
	note('D5', 'q', { chordName: 'Bb' }),
	note('C5', 'q', { tieToNext: true }),
	note('C5', 'q'),
];

export const aiPassage = (treble: AiStackItem[], bass: AiStackItem[] = []): AiPassage => ({
	prompt: '[Melody] Twinkle',
	keySignature: 'F',
	beatsPerBar: 2,
	voices: [
		{ staff: StaffEnum.Treble, stack: treble },
		...(bass.length ? [{ staff: StaffEnum.Bass as const, stack: bass }] : []),
	],
});

describe('aiSheetCards', () => {
	it('converts an AI passage into a MultiSheet question with ties and chord names', () => {
		const question = passageToQuestion(aiPassage(twoBars));
		expect(question.key).to.equal('F');
		expect(question.beatsPerBar).to.equal(2);
		const stack = question.voices[0].stack;
		expect(question.voices[0].staff).to.equal(StaffEnum.Treble);
		expect(stack[0]).to.deep.equal({
			notes: [{ name: 'C', octave: 5 }],
			duration: 'q',
			chordName: 'F',
		});
		expect(stack[2].tie).to.deep.equal({ toNext: [0], fromPrevious: undefined });
		expect(stack[3].tie).to.deep.equal({ toNext: undefined, fromPrevious: [0] });
	});

	it('pads every voice with rests to the same whole number of bars', () => {
		const question = passageToQuestion(
			aiPassage(twoBars.slice(0, 3), [note('F3', 'h'), { ...note('F3', 'q'), rest: true }]),
		);
		const [treble, bass] = question.voices;
		expect(treble.stack.map((s) => s.duration)).to.deep.equal(['q', 'q', 'q', 'q']);
		expect(treble.stack[3]).to.deep.equal({ notes: [], duration: 'q', rest: true });
		expect(bass.stack[1]).to.deep.equal({ notes: [], duration: 'q', rest: true });
		expect(bass.stack.map((s) => s.duration)).to.deep.equal(['h', 'q', 'q']);
		expect(barProblems(question)).to.deep.equal([]);
	});

	it('keeps one voice per staff', () => {
		const passage = aiPassage(twoBars);
		const question = passageToQuestion({
			...passage,
			voices: [...passage.voices, ...passage.voices],
		});
		expect(question.voices.map((v) => v.staff)).to.deep.equal([StaffEnum.Treble]);
	});

	it('flags bars whose notes do not add up to the time signature', () => {
		const question = passageToQuestion(aiPassage([note('C5', 'hd'), note('D5', 'q')]));
		expect(barProblems(question)).to.deep.equal(['Treble bar 1 has 3 beats, expected 2']);
	});

	it('clamps out-of-range octaves and time signatures', () => {
		const question = passageToQuestion({
			...aiPassage([note('C9', 'h')]),
			beatsPerBar: 0,
		});
		expect(question.beatsPerBar).to.equal(undefined);
		expect(question.voices[0].stack[0].notes[0].octave).to.equal(8);
	});
});

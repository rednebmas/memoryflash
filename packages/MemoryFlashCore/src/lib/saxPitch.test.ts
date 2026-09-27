import { expect } from 'chai';
import { Midi } from 'tonal';
import {
	PitchState,
	PitchStep,
	frequencyToWrittenMidi,
	holdProgress,
	initialPitchState,
	stabilizePitch,
} from './saxPitch';

const feed = (frames: (number | undefined)[]) => {
	const events: string[] = [];
	frames.reduce((state, midi) => {
		const step: PitchStep = stabilizePitch(state, midi, 500);
		if (step.off !== undefined) events.push(`off ${step.off}`);
		if (step.on !== undefined) events.push(`on ${step.on}`);
		return step.state;
	}, initialPitchState);
	return events;
};

const after = (frames: (number | undefined)[]) =>
	frames.reduce<PitchState>(
		(state, midi) => stabilizePitch(state, midi, 500).state,
		initialPitchState,
	);

const repeat = (midi: number | undefined, n: number) => Array(n).fill(midi);

describe('frequencyToWrittenMidi', () => {
	it('transposes concert pitch to the written note', () => {
		const concertEb4 = Midi.midiToFreq(Midi.toMidi('Eb4')!);
		expect(frequencyToWrittenMidi(concertEb4, 'alto')).to.equal(Midi.toMidi('C5'));
		const concertBb3 = Midi.midiToFreq(Midi.toMidi('Bb3')!);
		expect(frequencyToWrittenMidi(concertBb3, 'tenor')).to.equal(Midi.toMidi('C5'));
		expect(frequencyToWrittenMidi(concertBb3, 'soprano')).to.equal(Midi.toMidi('C4'));
	});

	it('snaps to the nearest natural note when asked', () => {
		const sharpishF = Midi.midiToFreq(Midi.toMidi('Ab3')! + 0.6);
		expect(frequencyToWrittenMidi(sharpishF, 'alto')).to.equal(Midi.toMidi('F#4'));
		expect(frequencyToWrittenMidi(sharpishF, 'alto', true)).to.equal(Midi.toMidi('F4'));
		const flatC = Midi.midiToFreq(Midi.toMidi('Eb4')! - 0.45);
		expect(frequencyToWrittenMidi(flatC, 'alto', true)).to.equal(Midi.toMidi('C5'));
		const lowE = Midi.midiToFreq(Midi.toMidi('G3')! + 0.4);
		expect(frequencyToWrittenMidi(lowE, 'alto', true)).to.equal(Midi.toMidi('E4'));
	});

	it('rounds slightly out of tune notes to the nearest pitch', () => {
		expect(frequencyToWrittenMidi(446, 'alto')).to.equal(69 + 9);
	});
});

describe('stabilizePitch', () => {
	it('requires holding a note for half a second', () => {
		expect(feed([...repeat(60, 25), ...repeat(undefined, 10)])).to.deep.equal([]);
		expect(feed(repeat(60, 30))).to.deep.equal(['on 60']);
	});

	it('uses a custom hold duration', () => {
		const frames = repeat(60, 15);
		const events = frames.reduce<PitchStep>(
			(step, midi) => stabilizePitch(step.state, midi, 250),
			{ state: initialPitchState },
		);
		expect(events.state.active).to.equal(60);
		expect(holdProgress(after(repeat(60, 15)), 1000)).to.equal(0.25);
	});

	it('keeps the hold through a brief wobble', () => {
		expect(feed([...repeat(60, 15), ...repeat(61, 2), ...repeat(60, 15)])).to.deep.equal([
			'on 60',
		]);
	});

	it('restarts the hold when the pitch changes', () => {
		expect(feed([...repeat(60, 20), ...repeat(62, 20)])).to.deep.equal([]);
	});

	it('turns a sustained note on and off after silence', () => {
		expect(feed([...repeat(60, 40), ...repeat(undefined, 10)])).to.deep.equal([
			'on 60',
			'off 60',
		]);
	});

	it('survives a short dropout mid-note', () => {
		expect(feed([...repeat(60, 40), ...repeat(undefined, 3), ...repeat(60, 10)])).to.deep.equal(
			['on 60'],
		);
	});

	it('switches directly between notes', () => {
		expect(feed([...repeat(60, 40), ...repeat(62, 40)])).to.deep.equal([
			'on 60',
			'off 60',
			'on 62',
		]);
	});
});

describe('holdProgress', () => {
	it('fills while a note is held and is full once it counts', () => {
		expect(holdProgress(after(repeat(60, 15)), 500)).to.equal(0.5);
		expect(holdProgress(after(repeat(60, 40)), 500)).to.equal(1);
	});

	it('is empty in silence', () => {
		expect(holdProgress(after(repeat(undefined, 10)))).to.equal(0);
	});
});

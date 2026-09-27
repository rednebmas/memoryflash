import { expect } from 'chai';
import { Midi } from 'tonal';
import { PitchStep, frequencyToWrittenMidi, initialPitchState, stabilizePitch } from './saxPitch';

const feed = (frames: (number | undefined)[]) => {
	const events: string[] = [];
	frames.reduce((state, midi) => {
		const step: PitchStep = stabilizePitch(state, midi);
		if (step.off !== undefined) events.push(`off ${step.off}`);
		if (step.on !== undefined) events.push(`on ${step.on}`);
		return step.state;
	}, initialPitchState);
	return events;
};

const repeat = (midi: number | undefined, n: number) => Array(n).fill(midi);

describe('frequencyToWrittenMidi', () => {
	it('transposes concert pitch to the written note', () => {
		const concertEb4 = Midi.midiToFreq(Midi.toMidi('Eb4')!);
		expect(frequencyToWrittenMidi(concertEb4, 'alto')).to.equal(Midi.toMidi('C5'));
		const concertBb3 = Midi.midiToFreq(Midi.toMidi('Bb3')!);
		expect(frequencyToWrittenMidi(concertBb3, 'tenor')).to.equal(Midi.toMidi('C5'));
		expect(frequencyToWrittenMidi(concertBb3, 'soprano')).to.equal(Midi.toMidi('C4'));
	});

	it('rounds slightly out of tune notes to the nearest pitch', () => {
		expect(frequencyToWrittenMidi(446, 'alto')).to.equal(69 + 9);
	});
});

describe('stabilizePitch', () => {
	it('ignores brief blips', () => {
		expect(feed([...repeat(60, 3), ...repeat(undefined, 10)])).to.deep.equal([]);
	});

	it('turns a sustained note on and off after silence', () => {
		expect(feed([...repeat(60, 20), ...repeat(undefined, 10)])).to.deep.equal([
			'on 60',
			'off 60',
		]);
	});

	it('survives a short dropout mid-note', () => {
		expect(feed([...repeat(60, 10), ...repeat(undefined, 3), ...repeat(60, 10)])).to.deep.equal(
			['on 60'],
		);
	});

	it('switches directly between notes', () => {
		expect(feed([...repeat(60, 10), ...repeat(62, 10)])).to.deep.equal([
			'on 60',
			'off 60',
			'on 62',
		]);
	});
});

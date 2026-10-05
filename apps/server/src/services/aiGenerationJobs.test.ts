import { expect } from 'chai';
import { GenerateCardsInput } from 'MemoryFlashCore/src/types/GeneratedCards';
import { Err } from '../middleware/errorHandler';
import { getGenerationJob, startGenerationJob } from './aiGenerationJobs';

const input: GenerateCardsInput = {
	text: 'x',
	cardTypes: ['Chord Memory'],
	splitLongSections: false,
	romanVariants: false,
};

const aiSong = {
	title: 'Song',
	artist: '',
	key: 'C',
	patterns: [],
	cards: [
		{ prompt: '[Verse] Song', chords: ['C'], key: '', patternId: 'A', notation: 'chordNames' },
	],
};

const deferred = () => {
	let resolve: (v: string) => void = () => {};
	let reject: (e: Error) => void = () => {};
	const promise = new Promise<string>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
};

const thrown = (fn: () => void) => {
	try {
		fn();
	} catch (e) {
		return e;
	}
};

const tick = () => new Promise((r) => setImmediate(r));

describe('aiGenerationJobs', () => {
	it('reports the generating stage, then the finished song once', async () => {
		const ai = deferred();
		const id = startGenerationJob('u1', input, [], () => ai.promise);
		expect(getGenerationJob(id, 'u1')).to.deep.equal({ stage: 'generating', song: undefined });
		ai.resolve(JSON.stringify(aiSong));
		await tick();
		expect(getGenerationJob(id, 'u1').song?.cards).to.have.length(1);
		expect(thrown(() => getGenerationJob(id, 'u1'))).to.be.instanceOf(Err);
	});

	it('hides jobs from other users', () => {
		const id = startGenerationJob('u1', input, [], () => deferred().promise);
		expect(thrown(() => getGenerationJob(id, 'u2'))).to.be.instanceOf(Err);
	});

	it('rejects invalid input before starting a job', () => {
		expect(
			thrown(() => startGenerationJob('u1', { ...input, text: ' ' }, [])),
		).to.be.instanceOf(Err);
	});

	it('surfaces a failed generation as a readable error', async () => {
		const ai = deferred();
		const id = startGenerationJob('u1', input, [], () => ai.promise);
		ai.reject(new Error('socket hang up'));
		await tick();
		expect(thrown(() => getGenerationJob(id, 'u1')))
			.to.be.instanceOf(Err)
			.with.property('msg')
			.that.matches(/try again/);
	});
});

import { expect } from 'chai';
import { makeTestStore } from '../testStore';
import { generateCards } from './generate-cards-action';
import { GenerateCardsInput, GeneratedSong } from '../../types/GeneratedCards';

const input: GenerateCardsInput = {
	text: 'x',
	instructions: '',
	cardTypes: ['Chord Memory'],
	splitLongSections: false,
	romanVariants: false,
	image: 'data:image/png;base64,AAAA',
};

const song: GeneratedSong = { title: 'Song', artist: '', key: 'C', patterns: [], cards: [] };

type Progress = { onUploadProgress: (e: { loaded: number; total?: number }) => void };

const run = async (polls: object[]) => {
	const store = makeTestStore();
	const seen: string[] = [];
	const record = () => {
		const g = store.getState().generatedCards.generation;
		seen.push(g ? `${g.stage}${g.stage === 'uploading' ? g.uploadPercent : ''}` : 'none');
	};
	const post = async (url: string, _: object, config: Progress) => {
		record();
		config.onUploadProgress({ loaded: 50, total: 100 });
		record();
		return { data: { jobId: 'j1' }, url };
	};
	const get = async (url: string) => {
		record();
		const next = polls.shift();
		if (next instanceof Error) throw next;
		return { data: next, url };
	};
	const thunk = generateCards('d1', input, 0);
	await thunk(store.dispatch as never, store.getState, { api: { post, get } } as never);
	record();
	return { store, seen };
};

describe('generateCards', () => {
	it('moves through upload, generating and building stages until the song arrives', async () => {
		const { store, seen } = await run([
			{ stage: 'generating' },
			{ stage: 'building' },
			{ song },
		]);
		expect(seen).to.deep.equal([
			'uploading0',
			'uploading50',
			'generating',
			'generating',
			'building',
			'none',
		]);
		expect(store.getState().generatedCards.song).to.deep.equal(song);
		expect(store.getState().network._.generateCards?.isLoading).to.equal(false);
	});

	it('stops polling and shows an error when the job fails', async () => {
		const { store, seen } = await run([{ stage: 'generating' }, new Error('Network Error')]);
		expect(seen.at(-1)).to.equal('none');
		expect(store.getState().network._.generateCards?.error).to.be.a('string');
		expect(store.getState().generatedCards.song).to.equal(null);
	});
});

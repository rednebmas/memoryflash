import { expect } from 'chai';
import {
	finalizeSong,
	generateSongCards,
	normalizeKey,
	romanVariantPrompt,
	splitChords,
} from './aiCardService';
import {
	GenerateCardsInput,
	GeneratedChordCard,
	GeneratedSheetCard,
} from 'MemoryFlashCore/src/types/GeneratedCards';
import { aiPassage, twoBars } from './aiSheetCards.test';

const input: GenerateCardsInput = {
	text: 'x',
	cardTypes: ['Chord Memory'],
	splitLongSections: true,
	romanVariants: true,
};

const aiSong = {
	title: 'Hotel California',
	artist: 'Eagles',
	key: 'B minor',
	patterns: [{ id: 'A', chords: ['Bm', 'F#'], sections: ['Verse'] }],
	cards: [
		{
			prompt: '[Verse] Hotel California',
			chords: ['Bm', 'F#', 'A', 'E', 'G', 'D', 'Em', 'F#', 'Bm', 'F#'],
			key: 'B minor',
			patternId: 'A',
			notation: 'chordNames' as const,
		},
		{
			prompt: '[Bridge] Hotel California',
			chords: ['Xyz', 'G'],
			key: '',
			patternId: 'B',
			notation: 'chordNames' as const,
		},
	],
};

describe('aiCardService', () => {
	it('normalizes keys', () => {
		expect(normalizeKey('B minor')).to.equal('Bm');
		expect(normalizeKey('Bb major')).to.equal('Bb');
		expect(normalizeKey('f# min')).to.equal('F#m');
		expect(normalizeKey('E♭')).to.equal('Eb');
		expect(normalizeKey('??')).to.equal('C');
	});

	it('splits long progressions evenly and labels parts', () => {
		expect(splitChords(['a', 'b', 'c'], 2)).to.deep.equal([['a', 'b'], ['c']]);
		expect(splitChords(Array(10).fill('C')).map((p) => p.length)).to.deep.equal([5, 5]);
		expect(romanVariantPrompt('[Verse] Song')).to.equal('[Verse · roman numerals] Song');
		expect(romanVariantPrompt('ii V I in C')).to.equal('ii V I in C · roman numerals');
	});

	it('finalizes cards with parts, roman variants and invalid chord flags', () => {
		const song = finalizeSong(aiSong, input);
		expect(song.key).to.equal('Bm');
		expect(song.cards.map((c) => c.prompt)).to.deep.equal([
			'[Verse · Part 1] Hotel California',
			'[Verse · Part 2] Hotel California',
			'[Bridge] Hotel California',
			'[Verse · Part 1 · roman numerals] Hotel California',
			'[Verse · Part 2 · roman numerals] Hotel California',
			'[Bridge · roman numerals] Hotel California',
		]);
		const cards = song.cards as GeneratedChordCard[];
		expect(cards[0].type).to.equal('Chord Memory');
		expect(cards[0].chords).to.deep.equal(['Bm', 'F#', 'A', 'E', 'G']);
		expect(cards[2].key).to.equal('Bm');
		expect(cards[2].invalidChords).to.deep.equal(['Xyz']);
		expect(cards[3].notation).to.equal('romanNumerals');
	});

	it('keeps whole sections when splitting is off', () => {
		const song = finalizeSong(aiSong, {
			...input,
			splitLongSections: false,
			romanVariants: false,
		});
		expect(song.cards).to.have.length(2);
		expect((song.cards[0] as GeneratedChordCard).chords).to.have.length(10);
	});

	it('parses the completion and passes existing cards as context', async () => {
		let prompt = '';
		const complete = async (_system: string, user: string) => {
			prompt = user;
			return JSON.stringify(aiSong);
		};
		const song = await generateSongCards(
			input,
			[{ prompt: '[Chorus] Vienna', chords: ['C', 'G'] }],
			complete,
		);
		expect(prompt).to.contain('[Chorus] Vienna: C G');
		expect(song.title).to.equal('Hotel California');
		expect(prompt).not.to.contain('attached image');
	});

	it('sends the single prompt box to the model as the request', async () => {
		let prompt = '';
		const complete = async (_system: string, user: string) => {
			prompt = user;
			return JSON.stringify(aiSong);
		};
		const text = 'skip the bridge\n[Verse]\nBm F#';
		await generateSongCards({ ...input, text }, [], complete);
		expect(prompt.endsWith(`Request:\n\n${text}`)).to.equal(true);
		expect(prompt).not.to.contain('Instructions');
	});

	it('sends an attached photo to the model with the user text', async () => {
		let sent: { user: string; image?: string } = { user: '' };
		const complete = async (_s: string, user: string, _schema: object, image?: string) => {
			sent = { user, image };
			return JSON.stringify(aiSong);
		};
		const image = 'data:image/jpeg;base64,abc';
		await generateSongCards({ ...input, text: 'transcribe the chords', image }, [], complete);
		expect(sent.image).to.equal(image);
		expect(sent.user).to.contain('attached image');
		expect(sent.user).to.contain('transcribe the chords');
	});

	it('rejects attachments that are not image data URLs', async () => {
		const complete = async () => JSON.stringify(aiSong);
		const err = await generateSongCards(
			{ ...input, image: 'https://example.com/x.png' },
			[],
			complete,
		).catch((e) => e);
		expect(err).to.have.property('httpStatus', 400);
	});

	it('creates sheet music and chord cards from one submission', () => {
		const song = finalizeSong(
			{ ...aiSong, passages: [aiPassage(twoBars)] },
			{ ...input, cardTypes: ['Sheet Music', 'Chord Memory'], romanVariants: false },
		);
		expect(song.cards.map((c) => c.type)).to.deep.equal([
			'Sheet Music',
			'Chord Memory',
			'Chord Memory',
			'Chord Memory',
		]);
		const sheet = song.cards[0] as GeneratedSheetCard;
		expect(sheet.prompt).to.equal('[Melody] Twinkle');
		expect(sheet.question.presentationModes).to.deep.equal([{ id: 'Sheet Music' }]);
	});

	it('splits long passages into four-bar parts for each selected notation type', () => {
		const sixBars = Array(6).fill(twoBars.slice(0, 2)).flat();
		const song = finalizeSong(
			{ ...aiSong, cards: [], passages: [aiPassage(sixBars)] },
			{ ...input, cardTypes: ['Sheet Music', 'Text Prompt'] },
		);
		const cards = song.cards as GeneratedSheetCard[];
		expect(cards.map((c) => `${c.type}: ${c.prompt}`)).to.deep.equal([
			'Sheet Music: [Melody · Part 1] Twinkle',
			'Sheet Music: [Melody · Part 2] Twinkle',
			'Text Prompt: [Melody · Part 1] Twinkle',
			'Text Prompt: [Melody · Part 2] Twinkle',
		]);
		expect(cards[2].question.presentationModes).to.deep.equal([
			{ id: 'Text Prompt', text: '[Melody · Part 1] Twinkle' },
		]);
		expect(cards[0].question.voices[0].stack).to.have.length(8);
	});

	it('asks for notation only when a notation card type is selected', async () => {
		let sent: { system: string; schema: { properties?: object } } = { system: '', schema: {} };
		const complete = async (system: string, _u: string, schema: object) => {
			sent = { system, schema };
			return JSON.stringify({ ...aiSong, passages: [aiPassage(twoBars)] });
		};
		const song = await generateSongCards(
			{ ...input, cardTypes: ['Sheet Music'] },
			[],
			complete,
		);
		expect(Object.keys(sent.schema.properties ?? {})).to.include('passages');
		expect(Object.keys(sent.schema.properties ?? {})).not.to.include('cards');
		expect(sent.system).to.contain('notation');
		expect(song.cards.every((c) => c.type === 'Sheet Music')).to.equal(true);

		await generateSongCards(input, [], complete);
		expect(Object.keys(sent.schema.properties ?? {})).to.include('cards');
		expect(Object.keys(sent.schema.properties ?? {})).not.to.include('passages');
	});

	it('never generates from a photo without text', async () => {
		const complete = async () => JSON.stringify(aiSong);
		const image = 'data:image/jpeg;base64,abc';
		const err = await generateSongCards({ ...input, text: ' ', image }, [], complete).catch(
			(e) => e,
		);
		expect(err).to.have.property('httpStatus', 400);
	});

	it('falls back to chord cards when no card type is sent', async () => {
		const complete = async () => JSON.stringify(aiSong);
		const legacy = { ...input, cardTypes: undefined } as never as GenerateCardsInput;
		const song = await generateSongCards(legacy, [], complete);
		expect(song.cards[0].type).to.equal('Chord Memory');
	});
});

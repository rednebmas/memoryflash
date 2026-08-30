import { expect } from 'chai';
import {
	finalizeSong,
	generateSongCards,
	normalizeKey,
	romanVariantPrompt,
	splitChords,
} from './aiCardService';
import { GenerateCardsInput } from 'MemoryFlashCore/src/types/GeneratedCards';

const input: GenerateCardsInput = {
	text: 'x',
	instructions: '',
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
		expect(song.cards[0].chords).to.deep.equal(['Bm', 'F#', 'A', 'E', 'G']);
		expect(song.cards[2].key).to.equal('Bm');
		expect(song.cards[2].invalidChords).to.deep.equal(['Xyz']);
		expect(song.cards[3].notation).to.equal('romanNumerals');
	});

	it('keeps whole sections when splitting is off', () => {
		const song = finalizeSong(aiSong, {
			...input,
			splitLongSections: false,
			romanVariants: false,
		});
		expect(song.cards).to.have.length(2);
		expect(song.cards[0].chords).to.have.length(10);
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
	});
});

import { expect } from 'chai';
import { textPromptLines } from './textPrompt';

describe('textPromptLines', () => {
	it('puts the song first and a trailing section second', () => {
		expect(textPromptLines('Torn Chorus')).to.deep.equal(['Torn', 'Chorus']);
		expect(textPromptLines('Torn Pre-chorus')).to.deep.equal(['Torn', 'Pre-chorus']);
		expect(textPromptLines('Reckless Verse Chorus Transition')).to.deep.equal([
			'Reckless',
			'Verse Chorus Transition',
		]);
	});

	it('handles a leading section word', () => {
		expect(textPromptLines('Intro Dreaming')).to.deep.equal(['Dreaming', 'Intro']);
	});

	it('splits bracketed sections on either side', () => {
		expect(textPromptLines('[Verse] Hotel California')).to.deep.equal([
			'Hotel California',
			'Verse',
		]);
		expect(textPromptLines('She Gets What She Wants [Verse]')).to.deep.equal([
			'She Gets What She Wants',
			'Verse',
		]);
		expect(textPromptLines('[Chorus - Part A] Wild Horses')).to.deep.equal([
			'Wild Horses',
			'Chorus - Part A',
		]);
	});

	it('keeps text without a section as one line', () => {
		expect(textPromptLines('Ascending')).to.deep.equal(['Ascending']);
		expect(textPromptLines('G# across clefs')).to.deep.equal(['G# across clefs']);
		expect(textPromptLines('Chorus')).to.deep.equal(['Chorus']);
	});

	it('leaves markdown to the markdown renderer', () => {
		expect(textPromptLines('## Verse 1 • Part 1\n# Vienna')).to.equal(null);
		expect(textPromptLines('# [Chorus] Hotel California')).to.equal(null);
		expect(textPromptLines('**Key of C**\n\nI – IV')).to.equal(null);
	});
});

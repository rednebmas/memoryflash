import { expect } from 'chai';
import { AnswerType, Card, CardTypeEnum } from '../types/Cards';
import { MultiSheetQuestion } from '../types/MultiSheetCard';
import { withChordNames, writtenChordNames } from './chordNames';
import { questionsForAllMajorKeys, transposeQuestion } from './multiKeyTransposer';
import { soEasyBb, soEasyC } from './testData/soEasyToFallInLove';
import {
	syncedCopy,
	transposedCopies,
	transposedCopyUpdates,
	transpositionInterval,
} from './transposedCopies';

const card = (id: string, question: MultiSheetQuestion, deckId = 'd1') =>
	({
		_id: id,
		deckId,
		type: CardTypeEnum.MultiSheet,
		question: { ...question, presentationModes: [{ id: 'Sheet Music' }] },
		answer: { type: AnswerType.ExactMulti },
	}) as Card;

const names = ['Fmaj7', 'Em7', 'C7'];
const sheetMusic = [{ id: 'Sheet Music' as const }];
const named = { ...withChordNames(soEasyC, names), presentationModes: sheetMusic };

describe('transposeQuestion', () => {
	it('transposes chord names with the notes', () => {
		const g = transposeQuestion(withChordNames(soEasyC, names), 'F#');
		expect(writtenChordNames(g).slice(0, 3)).to.deep.equal(['Bmaj7', 'A#m7', 'F#7']);
	});
});

describe('transpositionInterval', () => {
	it("links Sam's real C and Bb cards", () => {
		expect(transpositionInterval(soEasyC, soEasyBb)).to.equal('7m');
	});

	it('links every copy made by the transposer, whatever octave it picked', () => {
		const copies = questionsForAllMajorKeys(soEasyC, 'C3', 'C5');
		expect(copies.every((q) => transpositionInterval(soEasyC, q))).to.equal(true);
	});

	it('rejects cards whose notes differ', () => {
		const other = { ...soEasyBb, key: 'C' };
		expect(transpositionInterval(soEasyC, other)).to.equal(null);
		const changed = withChordNames(soEasyC, []);
		changed.voices[0].stack[1] = { ...changed.voices[0].stack[1], duration: 'q' };
		expect(transpositionInterval(soEasyC, changed)).to.equal(null);
	});
});

describe('transposedCopies', () => {
	it('finds copies in the same deck only', () => {
		const cards = [
			card('c', soEasyC),
			card('bb', soEasyBb),
			card('other-deck', soEasyBb, 'd2'),
			card('unrelated', { ...soEasyBb, key: 'C' }),
		];
		expect(transposedCopies(cards, cards[0], soEasyC).map((c) => c._id)).to.deep.equal(['bb']);
	});
});

describe('syncedCopy', () => {
	it('transposes new names onto an unnamed copy', () => {
		const synced = syncedCopy(soEasyC, named, soEasyBb);
		expect(writtenChordNames(synced!).slice(0, 4)).to.deep.equal([
			'Ebmaj7',
			'Dm7',
			'Bb7',
			undefined,
		]);
	});

	it('updates names it propagated before but keeps names typed on the copy', () => {
		const before = withChordNames(soEasyC, names);
		const copy = withChordNames(soEasyBb, ['Ebmaj7', 'Dm7', 'Gm6']);
		const fixed = withChordNames(soEasyC, ['F6', 'Em7', 'A7']);
		const synced = syncedCopy(before, fixed, copy);
		expect(writtenChordNames(synced!).slice(0, 3)).to.deep.equal(['Eb6', 'Dm7', 'Gm6']);
	});

	it('copies the Roman Numerals display mode but never a text prompt', () => {
		const roman = { ...named, presentationModes: [{ id: 'Roman Numerals' as const }] };
		const sheetCopy = { ...soEasyBb, presentationModes: sheetMusic };
		expect(syncedCopy(soEasyC, roman, sheetCopy)?.presentationModes).to.deep.equal([
			{ id: 'Roman Numerals' },
		]);
		const textCopy = {
			...soEasyBb,
			presentationModes: [{ id: 'Text Prompt' as const, text: 'x' }],
		};
		expect(syncedCopy(soEasyC, roman, textCopy)?.presentationModes?.[0].id).to.equal(
			'Text Prompt',
		);
	});

	it('does nothing when the edit changed the notes', () => {
		const edited = { ...soEasyBb, key: 'C' };
		expect(syncedCopy(soEasyC, edited, soEasyBb)).to.equal(null);
	});
});

describe('transposedCopyUpdates', () => {
	it('skips copies that are already in sync', () => {
		const cards = [card('c', soEasyC), card('bb', soEasyBb)];
		const unchanged = { ...soEasyC, presentationModes: sheetMusic };
		expect(transposedCopyUpdates(cards, cards[0], unchanged)).to.deep.equal([]);
		const updates = transposedCopyUpdates(cards, cards[0], named);
		expect(updates.map((u) => u.id)).to.deep.equal(['bb']);
	});
});

import { expect } from 'chai';
import { setupDBConnectionForTesting } from '../../../config/test-setup';
import { Card } from '../../../models/Card';
import Course from '../../../models/Course';
import { generateNoteReadingCourse, generateNoteReadingDecks } from './note-reading-generator';

const deckNotes = (name: string) => {
	const found = generateNoteReadingDecks('course').find(([deck]) => deck.name === name);
	return found![1]
		.map((card) =>
			card.question.voices.map(
				(v) => `${v.staff} ${v.stack[0].notes[0].name}${v.stack[0].notes[0].octave}`,
			),
		)
		.flat();
};

describe('note reading generator', () => {
	it('starts with FACE on the treble clef', () => {
		expect(deckNotes('FACE (Spaces)')).to.deep.equal([
			'Treble F4',
			'Treble A4',
			'Treble C5',
			'Treble E5',
		]);
	});

	it('accumulates notes per clef', () => {
		expect(deckNotes('EGBDF (Lines)')).to.have.length(9);
		expect(deckNotes('GBDFA (Lines)')).to.have.length(9);
		expect(deckNotes('Both Clefs')).to.have.length(18);
	});

	it('ends ledger lines a fifth beyond each outer C', () => {
		expect(deckNotes('G6')).to.include.members(['Treble G6', 'Treble F3']);
		expect(deckNotes('F1')).to.include.members(['Bass G4', 'Bass F1']);
		expect(deckNotes('Everything')).to.have.length(46);
	});

	describe('course', () => {
		setupDBConnectionForTesting();

		it('upserts idempotently as a system course', async () => {
			await generateNoteReadingCourse();
			await generateNoteReadingCourse();
			const courses = await Course.find({ name: 'Sheet Music' });
			expect(courses).to.have.length(1);
			expect(courses[0].userId).to.equal(undefined);
			expect(courses[0].decks).to.have.length(22);
			expect(await Card.countDocuments()).to.be.greaterThan(0);
		});
	});
});

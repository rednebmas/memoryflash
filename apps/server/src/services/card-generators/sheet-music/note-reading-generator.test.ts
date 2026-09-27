import { expect } from 'chai';
import { setupDBConnectionForTesting } from '../../../config/test-setup';
import { Card } from '../../../models/Card';
import Course from '../../../models/Course';
import { Deck } from '../../../models/Deck';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import {
	createNoteCard,
	generateNoteReadingCourse,
	generateNoteReadingDecks,
} from './note-reading-generator';

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
		expect(deckNotes('Treble Ledger Lines')).to.include.members(['Treble G6', 'Treble F3']);
		expect(deckNotes('Treble Ledger Lines')).to.have.length(23);
		expect(deckNotes('Bass Ledger Lines')).to.include.members(['Bass G4', 'Bass F1']);
		expect(deckNotes('Everything')).to.have.length(46);
	});

	describe('course', () => {
		setupDBConnectionForTesting();

		it('removes decks that are no longer generated', async () => {
			const course = await new Course({ name: 'Sheet Music', decks: [] }).save();
			const stale = await new Deck({
				uid: 'old',
				courseId: course.id,
				name: 'Old',
				section: 'Old',
			}).save();
			await new Card({
				...createNoteCard('old', { staff: StaffEnum.Treble, note: 'C4' }),
				deckId: stale._id,
			}).save();
			course.decks = [stale._id];
			await course.save();

			await generateNoteReadingCourse();

			expect(await Deck.findById(stale._id)).to.equal(null);
			expect(await Card.countDocuments({ deckId: stale._id })).to.equal(0);
		});

		it('upserts idempotently as a system course', async () => {
			await generateNoteReadingCourse();
			await generateNoteReadingCourse();
			const courses = await Course.find({ name: 'Sheet Music' });
			expect(courses).to.have.length(1);
			expect(courses[0].userId).to.equal(undefined);
			expect(courses[0].decks).to.have.length(8);
			expect(await Card.countDocuments()).to.be.greaterThan(0);
		});
	});
});

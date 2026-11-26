import { expect } from 'chai';
import { setupDBConnectionForTesting } from '../../config/test-setup';
import { AnyOctaveAnswer } from 'MemoryFlashCore/src/types/Cards';
import { Card } from '../../models/Card';
import { generateIntervalCards, generateIntervalsCourse } from './interval-generators';

const answerFor = (note: string, interval: string, direction: string) => {
	const card = generateIntervalCards().noteNameCards.find(
		({ question: q }) =>
			q.note === note && q.interval === interval && q.direction === direction,
	);
	return (card?.answer as AnyOctaveAnswer | undefined)?.notes;
};

describe('interval generator', () => {
	it('names the note an interval above or below', () => {
		expect(answerFor('C', 'M3', 'up')).to.deep.equal(['E']);
		expect(answerFor('C', 'M3', 'down')).to.deep.equal(['Ab']);
		expect(answerFor('Eb', 'P5', 'up')).to.deep.equal(['Bb']);
		expect(answerFor('F#', 'm2', 'down')).to.deep.equal(['E#']);
	});

	it('skips answers that need a double sharp or flat', () => {
		expect(answerFor('A#', 'M3', 'up')).to.equal(undefined);
	});

	describe('course', () => {
		setupDBConnectionForTesting();

		it('puts every note name card in one Intervals deck', async () => {
			const { course, decks } = await generateIntervalsCourse();
			expect(course.name).to.equal('Intervals');
			expect(decks.map((d) => d.name)).to.deep.equal(['All Intervals']);
			expect(await Card.countDocuments({ deckId: decks[0]._id })).to.equal(
				generateIntervalCards().noteNameCards.length,
			);
		});
	});
});

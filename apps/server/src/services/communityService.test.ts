import { expect } from 'chai';
import { it } from 'mocha';
import { setupDBConnectionForTesting } from '../config/test-setup';
import Course from '../models/Course';
import { Deck } from '../models/Deck';
import { searchPublicDecks, searchPublicCourses } from '../services/communityService';

describe('communityService', () => {
	setupDBConnectionForTesting();

	describe('searchPublicDecks', () => {
		it('returns paginated public decks', async () => {
			const course = await Course.create({ name: 'Test Course', decks: [] });
			const decks = await Promise.all(
				Array.from({ length: 25 }, (_, i) =>
					Deck.create({
						uid: `deck-${i}`,
						name: `Deck ${i}`,
						courseId: course._id,
						section: 'Test',
						visibility: 'public',
						cardCount: i + 1,
					}),
				),
			);
			course.decks = decks.map((d) => d._id);
			await course.save();

			const page1 = await searchPublicDecks('', 1);
			expect(page1.decks).to.have.length(20);
			expect(page1.total).to.equal(25);
			expect(page1.page).to.equal(1);
			expect(page1.totalPages).to.equal(2);

			const page2 = await searchPublicDecks('', 2);
			expect(page2.decks).to.have.length(5);
			expect(page2.page).to.equal(2);
		});

		it('filters by search query', async () => {
			const course = await Course.create({ name: 'Test Course', decks: [] });
			await Deck.create({
				uid: 'treble-deck',
				name: 'Treble Clef',
				courseId: course._id,
				section: 'Test',
				visibility: 'public',
			});
			await Deck.create({
				uid: 'bass-deck',
				name: 'Bass Clef',
				courseId: course._id,
				section: 'Test',
				visibility: 'public',
			});

			const result = await searchPublicDecks('Treble', 1);
			expect(result.decks).to.have.length(1);
			expect(result.decks[0].name).to.equal('Treble Clef');
		});

		it('excludes private decks', async () => {
			const course = await Course.create({ name: 'Test Course', decks: [] });
			await Deck.create({
				uid: 'public-deck',
				name: 'Public Deck',
				courseId: course._id,
				section: 'Test',
				visibility: 'public',
			});
			await Deck.create({
				uid: 'private-deck',
				name: 'Private Deck',
				courseId: course._id,
				section: 'Test',
				visibility: 'private',
			});

			const result = await searchPublicDecks('', 1);
			expect(result.decks).to.have.length(1);
			expect(result.decks[0].name).to.equal('Public Deck');
		});
	});

	describe('searchPublicCourses', () => {
		it('returns paginated public courses with card counts', async () => {
			for (let i = 0; i < 25; i++) {
				const course = await Course.create({
					name: `Course ${i}`,
					decks: [],
					visibility: 'public',
				});
				const deck = await Deck.create({
					uid: `course-${i}-deck`,
					name: `Deck for Course ${i}`,
					courseId: course._id,
					section: 'Test',
					cardCount: 10,
				});
				course.decks = [deck._id];
				await course.save();
			}

			const page1 = await searchPublicCourses('', 1);
			expect(page1.courses).to.have.length(20);
			expect(page1.total).to.equal(25);
			expect(page1.totalPages).to.equal(2);
			expect(page1.courses[0].totalCardCount).to.equal(10);

			const page2 = await searchPublicCourses('', 2);
			expect(page2.courses).to.have.length(5);
		});
	});
});

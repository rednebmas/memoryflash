import Course from '../models/Course';
import Attempt from '../models/Attempt';
import { Card } from '../models/Card';
import { Deck } from '../models/Deck';
import { MultiSheetQuestion } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { Answer } from 'MemoryFlashCore/src/types/Cards';

export async function updateCard(
	cardId: string,
	question: MultiSheetQuestion,
	userId: string,
	answer?: Answer,
) {
	const card = await Card.findById(cardId);
	if (!card) return null;
	const deck = await Deck.findById(card.deckId);
	if (!deck) return null;
	const course = await Course.findById(deck.courseId);
	if (!course || course.userId?.toString() !== userId) return null;

	card.question = question;
	if (answer) card.answer = answer;
	await card.save();
	return card;
}

export async function deleteCard(cardId: string, userId: string) {
	const card = await Card.findById(cardId);
	if (!card) return;
	const deck = await Deck.findById(card.deckId);
	if (!deck) return;
	const course = await Course.findById(deck.courseId);
	if (!course || course.userId?.toString() !== userId) return;
	await Promise.all([Card.deleteOne({ _id: cardId }), Attempt.deleteMany({ cardId })]);
}

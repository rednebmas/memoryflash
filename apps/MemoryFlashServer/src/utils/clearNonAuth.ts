import mongoose from 'mongoose';
import Attempt from '../models/Attempt';
import { Card } from '../models/Card';
import Course from '../models/Course';
import { Deck } from '../models/Deck';

export async function clearNonAuth() {
	await Promise.all([
		Attempt.deleteMany({}),
		Card.deleteMany({}),
		Course.deleteMany({}),
		Deck.deleteMany({}),
	]);

	console.log('☠️ Cleared non-auth');
}

import Attempt from '../models/Attempt';
import { Card } from '../models/Card';
import { UserDeckStats } from '../models/UserDeckStats';
import { processAttempt } from './statsService';

export async function replayAttemptsForUser(userId: string) {
	console.log('Replaying attempts for user:', userId);

	const [attempts] = await Promise.all([
		Attempt.find({ userId }).sort({ createdAt: 1 }),
		UserDeckStats.deleteMany({ userId }),
	]);

	for (let i = 0; i < attempts.length; i++) {
		const card = await Card.findById(attempts[i].cardId);
		if (card) {
			await processAttempt(attempts[i]);
		}
	}

	console.log(`Replayed ${attempts.length} attempts for user:`, userId);
}

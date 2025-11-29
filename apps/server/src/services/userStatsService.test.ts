import { expect } from 'chai';
import Attempt from '../models/Attempt';
import { Card } from '../models/Card';
import { UserStats } from '../models/UserStats';
import { seed } from '../config/test-seed';
import { setupDBConnectionForTesting } from '../config/test-setup';
import { getActivityDay, getOrCreateUserStats } from './userStatsService';
import { userOnLoadInfo } from './userOnLoadInfo';

const createAttempt = async (userId: string, deckId: string, cardId: string, attemptedAt: string) =>
	new Attempt({
		userId,
		cardId,
		deckId,
		batchId: attemptedAt,
		correct: true,
		timeTaken: 10,
		attemptedAt: new Date(attemptedAt),
	}).save();

const expectStats = async (
	userId: string,
	current: number,
	longest: number,
	lastActivityDate: string,
) => {
	const stats = await UserStats.findOne({ userId });
	expect(stats?.currentStreak).to.equal(current);
	expect(stats?.longestStreak).to.equal(longest);
	expect(stats?.lastActivityDate).to.equal(lastActivityDate);
};

describe('userStatsService', () => {
	setupDBConnectionForTesting();

	it('uses a 3am local cutoff for activity days', () => {
		const beforeReset = getActivityDay(new Date('2024-01-02T06:30:00Z'), 'America/New_York');
		const afterReset = getActivityDay(new Date('2024-01-02T08:00:00Z'), 'America/New_York');
		expect(beforeReset).to.equal('2024-01-01');
		expect(afterReset).to.equal('2024-01-02');
	});

	it('increments and resets streaks based on daily activity', async () => {
		const { user, deck } = await seed();
		const card = await Card.findOne({ deckId: deck._id });
		if (!card) throw new Error('Card not found');

		await getOrCreateUserStats(user._id.toString(), 'America/New_York');

		await createAttempt(
			user._id.toString(),
			deck._id.toString(),
			card._id.toString(),
			'2024-01-02T06:30:00Z',
		);
		await expectStats(user._id.toString(), 1, 1, '2024-01-01');

		await createAttempt(
			user._id.toString(),
			deck._id.toString(),
			card._id.toString(),
			'2024-01-02T12:00:00Z',
		);
		await expectStats(user._id.toString(), 2, 2, '2024-01-02');

		await createAttempt(
			user._id.toString(),
			deck._id.toString(),
			card._id.toString(),
			'2024-01-04T16:00:00Z',
		);
		await expectStats(user._id.toString(), 1, 2, '2024-01-04');
	});

	it('stores timezone and streak data via userOnLoadInfo', async () => {
		const { user } = await seed();
		const response = await userOnLoadInfo(user._id.toString(), 'Europe/London');
		expect(response.userStats?.timezone).to.equal('Europe/London');
		const storedStats = await UserStats.findOne({ userId: user._id });
		expect(storedStats?.timezone).to.equal('Europe/London');
	});
});

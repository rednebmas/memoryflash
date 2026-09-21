import { CardWithAttempts } from '../../types/CardWithAttempts';
import { AnswerType, CardTypeEnum, StaffEnum } from '../../types/Cards';
import { ScheduleContext } from './types';

export const NOW = new Date('2026-09-20T12:00:00.000Z');

export const makeCard = (
	_id: string,
	timeTaken?: number,
	type = CardTypeEnum.BasicSheet,
): CardWithAttempts =>
	({
		_id,
		uid: _id,
		deckId: 'd1',
		type,
		question: { staff: StaffEnum.Treble, notes: [] },
		answer: { type: AnswerType.AnyOctave, notes: [] },
		createdAt: NOW,
		updatedAt: NOW,
		attempts:
			timeTaken === undefined
				? []
				: [
						{
							_id: `a-${_id}`,
							userId: 'u',
							cardId: _id,
							deckId: 'd1',
							batchId: 'b',
							correct: true,
							timeTaken,
							presentationMode: null,
							attemptedAt: NOW.toISOString(),
						},
					],
	}) as CardWithAttempts;

export const makeContext = (overrides: Partial<ScheduleContext>): ScheduleContext => ({
	cards: [],
	reviews: {},
	queued: [],
	count: 4,
	clock: 0,
	random: () => 0.5,
	...overrides,
});

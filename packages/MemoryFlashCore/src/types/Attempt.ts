import { z } from 'zod';
import { MongoId } from './helper-types';

export const zAttempt = z.object({
	_id: z.string(),
	userId: z.string(),
	cardId: z.string(),
	deckId: z.string(),
	batchId: z.string(),
	correct: z.boolean(),
	timeTaken: z.number(),
	presentationMode: z.string().nullable(),
	attemptedAt: z.string(),
});

export type Attempt = z.infer<typeof zAttempt>;
export type AttemptMongo = Omit<
	Attempt,
	'userId' | 'cardId' | 'deckId' | 'attemptedAt' | 'batchId'
> & {
	userId: MongoId;
	cardId: MongoId;
	deckId: MongoId;
	batchId: MongoId;
	attemptedAt: Date;
};

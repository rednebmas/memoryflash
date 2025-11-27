import { Document, Schema, model } from 'mongoose';
import { processAttempt } from '../services/statsService';
import { AttemptMongo } from 'MemoryFlashCore/src/types/Attempt';

export type AttemptDoc = AttemptMongo & Document;

const attemptSchema = new Schema<AttemptDoc>({
	userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	cardId: { type: Schema.Types.ObjectId, ref: 'Card', required: true },
	deckId: { type: Schema.Types.ObjectId, ref: 'Deck', required: true },
	batchId: { type: Schema.Types.String, required: true },
	correct: { type: Boolean, required: true },
	timeTaken: { type: Number, required: true },
	presentationMode: { type: String, required: false },
	attemptedAt: { type: Date, default: Date.now, required: true },
});

// This isn't atomic, but it's probably good enough.
attemptSchema.pre('save', async function (next) {
	if (!this.isNew) {
		return next();
	}

	await processAttempt(this as AttemptDoc);
	next();
});

const Attempt = model('Attempt', attemptSchema);

export default Attempt;

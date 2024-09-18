import { Document, model, ObjectId, Schema } from 'mongoose';
import { _Card, CardTypeEnum } from '../submodules/MemoryFlashCore/src/types/Cards';

export type CardDoc = _Card<string | ObjectId> & Document;

const CardSchema = new Schema<CardDoc>(
	{
		uid: {
			type: String,
			required: true,
		},
		deckId: {
			type: Schema.Types.ObjectId,
			required: true,
		},
		type: {
			type: String,
			required: true,
			enum: Object.values(CardTypeEnum),
		},
		question: {
			type: Schema.Types.Mixed,
			required: true,
		},
		answer: {
			type: Schema.Types.Mixed,
			required: true,
		},
	},
	{
		toJSON: {
			transform: (_, ret: Partial<CardDoc>) => {
				delete ret.__v;
				delete ret.updatedAt;
			},
		},
		timestamps: true,
	},
);

export const Card = model<CardDoc>('Card', CardSchema);

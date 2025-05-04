import { Document, model, Schema, Types } from 'mongoose';
import { Deck as IDeck } from 'MemoryFlashCore/src/types/Deck';

export type DeckDoc = IDeck & Document;

const DeckSchema = new Schema<DeckDoc>(
	{
		uid: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		courseId: {
			type: String,
			required: true,
		},
		userId: {
			type: Types.ObjectId,
			ref: 'User',
		},
		section: { type: String, required: true },
		sectionSubtitle: { type: String, required: false },
		tags: {
			type: [String],
			required: false,
			default: [],
		},
	},
	{
		toJSON: {
			transform: (_, ret: Partial<DeckDoc>) => {
				delete ret.__v;
				delete ret.updatedAt;
			},
		},
		timestamps: true,
	},
);

export const Deck = model<DeckDoc>('Deck', DeckSchema);

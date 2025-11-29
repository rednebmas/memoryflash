import { Document, model, Schema } from 'mongoose';
import { Deck as IDeck, Visibility } from 'MemoryFlashCore/src/types/Deck';

export type DeckDoc = IDeck & Document;

const visibilityValues: Visibility[] = ['private', 'unlisted', 'public'];

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
		section: { type: String, required: true },
		sectionSubtitle: { type: String, required: false },
		tags: {
			type: [String],
			required: false,
			default: [],
		},
		visibility: {
			type: String,
			enum: visibilityValues,
			default: 'private',
		},
		importedFromDeckId: {
			type: String,
			required: false,
		},
	},
	{
		toJSON: {
			transform: (_, ret: Partial<DeckDoc>) => {
				delete ret.updatedAt;
			},
		},
		timestamps: true,
	},
);

export const Deck = model<DeckDoc>('Deck', DeckSchema);

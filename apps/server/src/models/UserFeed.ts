import { Document, Schema, model, Types } from 'mongoose';

export type RecentDeckFeedEntryDoc = {
	key: string;
	type: 'recentDeck';
	deckId: string;
	courseId: string;
	lastStudiedAt: Date;
};

export type UserFeedDoc = Document & {
	userId: Types.ObjectId;
	entries: RecentDeckFeedEntryDoc[];
};

const recentDeckEntrySchema = new Schema<RecentDeckFeedEntryDoc>(
	{
		key: { type: String, required: true },
		type: { type: String, required: true, enum: ['recentDeck'] },
		deckId: { type: String, required: true },
		courseId: { type: String, required: true },
		lastStudiedAt: { type: Date, required: true },
	},
	{ _id: false },
);

const userFeedSchema = new Schema<UserFeedDoc>(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
		entries: { type: [recentDeckEntrySchema], default: [] },
	},
	{
		timestamps: true,
	},
);

export const UserFeed = model<UserFeedDoc>('UserFeed', userFeedSchema);

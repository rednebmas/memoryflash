import { Document, model, Schema } from 'mongoose';
import { UserDeckStatsMongo } from 'MemoryFlashCore/src/types/UserDeckStats';

export type UserDeckStatsDoc = UserDeckStatsMongo & Document;

const UserDeckStatsSchema = new Schema<UserDeckStatsDoc>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			required: true,
		},
		deckId: {
			type: Schema.Types.ObjectId,
			required: true,
		},
		attempts: {
			type: Schema.Types.Mixed,
			of: Number,
			default: {},
		},
		medianTimeTaken: {
			type: Number,
			default: 0,
		},
		medianHistory: {
			type: Schema.Types.Mixed,
			default: [],
		},
	},
	{
		toJSON: {
			transform: (_, ret: Partial<UserDeckStatsDoc>) => {
				delete ret.updatedAt;
			},
		},
		timestamps: true,
	},
);

export const UserDeckStats = model<UserDeckStatsDoc>('UserDeckStats', UserDeckStatsSchema);

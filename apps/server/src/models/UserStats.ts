import { Document, model, Schema } from 'mongoose';
import { UserStatsMongo } from 'MemoryFlashCore/src/types/UserStats';

export type UserStatsDoc = UserStatsMongo & Document;

const UserStatsSchema = new Schema<UserStatsDoc>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			required: true,
			unique: true,
		},
		timezone: {
			type: String,
			default: 'UTC',
		},
		currentStreak: {
			type: Number,
			default: 0,
		},
		longestStreak: {
			type: Number,
			default: 0,
		},
		lastActivityDate: {
			type: String,
		},
	},
	{
		toJSON: {
			transform: (_, ret: Partial<UserStatsDoc>) => {
				delete ret.updatedAt;
			},
		},
		timestamps: true,
	},
);

export const UserStats = model<UserStatsDoc>('UserStats', UserStatsSchema);

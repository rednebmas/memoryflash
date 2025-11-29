import { Document, model, Schema, Types } from 'mongoose';

export interface LeaderboardEntry {
	deckId: Types.ObjectId;
	attemptCount: number;
}

export interface CommunityLeaderboardDoc extends Document {
	entries: LeaderboardEntry[];
	updatedAt: Date;
}

const LeaderboardEntrySchema = new Schema<LeaderboardEntry>(
	{
		deckId: { type: Schema.Types.ObjectId, ref: 'Deck', required: true },
		attemptCount: { type: Number, required: true, default: 0 },
	},
	{ _id: false },
);

const CommunityLeaderboardSchema = new Schema<CommunityLeaderboardDoc>(
	{
		entries: { type: [LeaderboardEntrySchema], default: [] },
	},
	{ timestamps: true },
);

export const CommunityLeaderboard = model<CommunityLeaderboardDoc>(
	'CommunityLeaderboard',
	CommunityLeaderboardSchema,
);

const MAX_LEADERBOARD_ENTRIES = 50;

export async function incrementLeaderboardForDeck(deckId: Types.ObjectId | string) {
	let leaderboard = await CommunityLeaderboard.findOne();
	if (!leaderboard) {
		leaderboard = new CommunityLeaderboard({ entries: [] });
	}

	const deckIdStr = deckId.toString();
	const existingIndex = leaderboard.entries.findIndex((e) => e.deckId.toString() === deckIdStr);

	if (existingIndex >= 0) {
		leaderboard.entries[existingIndex].attemptCount += 1;
	} else {
		const objectId = typeof deckId === 'string' ? new Types.ObjectId(deckId) : deckId;
		leaderboard.entries.push({ deckId: objectId, attemptCount: 1 });
	}

	leaderboard.entries.sort((a, b) => b.attemptCount - a.attemptCount);
	leaderboard.entries = leaderboard.entries.slice(0, MAX_LEADERBOARD_ENTRIES);

	await leaderboard.save();
}

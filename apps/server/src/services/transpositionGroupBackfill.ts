import { Card } from '../models/Card';
import { AnswerType, CardTypeEnum } from 'MemoryFlashCore/src/types/Cards';
import { MultiSheetQuestion } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { newGroupId, transpositionClusters } from 'MemoryFlashCore/src/lib/transpositionGroups';

export async function backfillTranspositionGroups() {
	const cards = await Card.find({
		uid: /^custom-/,
		type: CardTypeEnum.MultiSheet,
		'answer.type': { $ne: AnswerType.ChordMemory },
		transpositionGroup: { $exists: false },
	})
		.select('_id deckId question')
		.lean();
	const clusters = transpositionClusters(
		cards.map((c) => ({
			_id: c._id,
			deckId: String(c.deckId),
			question: c.question as MultiSheetQuestion,
		})),
	);
	await Promise.all(
		clusters.map((cluster) =>
			Card.updateMany(
				{ _id: { $in: cluster.map((c) => c._id) } },
				{ $set: { transpositionGroup: newGroupId() } },
			),
		),
	);
	if (clusters.length) console.log(`Linked ${clusters.length} transposition groups`);
}

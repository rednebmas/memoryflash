import { useMemo } from 'react';
import { Card } from 'MemoryFlashCore/src/types/Cards';
import { MultiSheetCard } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { buildScoreTimeline } from 'MemoryFlashCore/src/lib/scoreTimeline';
import { ValidatorEngine } from 'MemoryFlashCore/src/lib/ValidatorEngine';
import { useEngineHandle } from './useEngineHandle';

export const ExactMultiAnswerValidator: React.FC<{ card: Card }> = ({ card: _card }) => {
	const card = _card as MultiSheetCard;
	const timeline = useMemo(() => buildScoreTimeline(card.question), [card.question]);
	const engine = useMemo(() => new ValidatorEngine(timeline), [timeline]);
	useEngineHandle(engine);
	return null;
};

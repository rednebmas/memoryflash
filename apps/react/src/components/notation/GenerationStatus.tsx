import React from 'react';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { generationStatusSelector } from 'MemoryFlashCore/src/redux/selectors/generatedCardsSelector';
import Timer from '../../screens/StudyScreen/Timer';

export const GenerationStatus: React.FC = () => {
	const status = useAppSelector(generationStatusSelector);
	const startedAt = useAppSelector((state) => state.generatedCards.generation?.startedAt);
	if (!status || !startedAt) return null;
	return (
		<span className="caption" role="status" data-testid="generation-status">
			{status} · <Timer startTime={startedAt} />s
		</span>
	);
};

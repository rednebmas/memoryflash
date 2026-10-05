import { useMemo } from 'react';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { Card } from 'MemoryFlashCore/src/types/Cards';
import { MultiSheetCard } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { multiSheetEngine } from 'MemoryFlashCore/src/lib/ValidatorEngine';
import { selectGradesAnyOctave } from 'MemoryFlashCore/src/redux/selectors/activePresentationModeSelector';
import { useEngineHandle } from './useEngineHandle';

export const ExactMultiAnswerValidator: React.FC<{ card: Card }> = ({ card }) => {
	const { question } = card as MultiSheetCard;
	const anyOctave = useAppSelector(selectGradesAnyOctave);
	const engine = useMemo(() => multiSheetEngine(question, anyOctave), [question, anyOctave]);
	useEngineHandle(engine);
	return null;
};

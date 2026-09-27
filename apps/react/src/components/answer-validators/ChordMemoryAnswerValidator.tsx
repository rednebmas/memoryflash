import { useMemo } from 'react';
import { AnswerType, Card, ChordMemoryAnswer } from 'MemoryFlashCore/src/types/Cards';
import { ChordMemoryValidatorEngine } from 'MemoryFlashCore/src/lib/ChordMemoryValidatorEngine';
import { useEngineHandle } from './useEngineHandle';

export const ChordMemoryAnswerValidator: React.FC<{ card: Card }> = ({ card }) => {
	const answer = card.answer as ChordMemoryAnswer;
	const chords = answer.type === AnswerType.ChordMemory ? answer.chords : [];
	const engine = useMemo(() => new ChordMemoryValidatorEngine(chords), [chords]);
	useEngineHandle(engine);
	return null;
};

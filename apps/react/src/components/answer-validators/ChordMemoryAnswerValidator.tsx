import useDeepCompareEffect from 'use-deep-compare-effect';
import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { AnswerType, Card, ChordMemoryAnswer } from 'MemoryFlashCore/src/types/Cards';
import { ChordMemoryValidatorEngine } from 'MemoryFlashCore/src/lib/ChordMemoryValidatorEngine';

export const ChordMemoryAnswerValidator: React.FC<{ card: Card }> = ({ card }) => {
	const dispatch = useAppDispatch();
	const onNotes = useAppSelector((s) => s.midi.notes);
	const waiting = useAppSelector((s) => s.midi.waitingUntilEmpty);
	const index = useAppSelector((s) => s.scheduler.multiPartCardIndex);

	const answer = card.answer as ChordMemoryAnswer;
	const chords = answer.type === AnswerType.ChordMemory ? answer.chords : [];

	const engine = useMemo(() => new ChordMemoryValidatorEngine(chords), [chords]);

	useDeepCompareEffect(() => {
		engine.handle({
			onNotes: onNotes.map((n) => n.number),
			waiting,
			index,
			dispatch,
		});
	}, [onNotes]);

	return null;
};

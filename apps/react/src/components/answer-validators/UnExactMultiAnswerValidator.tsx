import useDeepCompareEffect from 'use-deep-compare-effect';
import { useMemo } from 'react';
import { Midi, Note } from 'tonal';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { Card } from 'MemoryFlashCore/src/types/Cards';
import { MultiSheetCard } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { buildScoreTimeline } from 'MemoryFlashCore/src/lib/scoreTimeline';
import { ValidatorEngine } from 'MemoryFlashCore/src/lib/ValidatorEngine';

export const UnExactMultiAnswerValidator: React.FC<{ card: Card }> = ({ card: _card }) => {
	const card = _card as MultiSheetCard;
	const dispatch = useAppDispatch();
	const onNotes = useAppSelector((s) => s.midi.notes);
	const waiting = useAppSelector((s) => s.midi.waitingUntilEmpty);
	const index = useAppSelector((s) => s.scheduler.multiPartCardIndex);
	const timeline = useMemo(() => buildScoreTimeline(card.question), [card.question]);
	const project = useMemo(() => (m: number) => Note.chroma(Midi.midiToNoteName(m)), []);
	const engine = useMemo(() => new ValidatorEngine(timeline, project), [timeline, project]);
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

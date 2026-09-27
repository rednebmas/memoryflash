import useDeepCompareEffect from 'use-deep-compare-effect';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { HandleArgs } from 'MemoryFlashCore/src/lib/addedNotes';

export const useEngineHandle = (engine: { handle: (args: HandleArgs) => void }) => {
	const dispatch = useAppDispatch();
	const notes = useAppSelector((s) => s.midi.notes);
	const waiting = useAppSelector((s) => s.midi.waitingUntilEmpty);
	const waitingNotes = useAppSelector((s) => s.midi.waitingUntilEmptyNotes);
	const index = useAppSelector((s) => s.scheduler.multiPartCardIndex);
	useDeepCompareEffect(() => {
		engine.handle({ notes, waitingNotes, waiting, index, dispatch });
	}, [notes]);
};

import { useEffect } from 'react';
import { markStepMissed } from 'MemoryFlashCore/src/redux/actions/rhythm-actions';
import { nextDeadlineMsSelector } from 'MemoryFlashCore/src/redux/selectors/rhythmSelectors';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';

export const RhythmDeadline: React.FC = () => {
	const dispatch = useAppDispatch();
	const deadline = useAppSelector(nextDeadlineMsSelector);
	const index = useAppSelector((s) => s.scheduler.multiPartCardIndex);

	useEffect(() => {
		if (deadline === undefined) return;
		const timer = window.setTimeout(
			() => dispatch(markStepMissed(index)),
			Math.max(0, deadline - performance.now()),
		);
		return () => window.clearTimeout(timer);
	}, [deadline, index]);

	return null;
};

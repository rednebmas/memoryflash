import { useEffect, useRef, useState } from 'react';
import { SaxRhythmSession } from 'MemoryFlashCore/src/lib/rhythm/saxRhythmSession';
import { PitchFrame } from 'MemoryFlashCore/src/lib/rhythm/types';
import {
	anchorSaxCard,
	reportCoverageStep,
} from 'MemoryFlashCore/src/redux/actions/rhythm-actions';
import { currRhythmCardSelector } from 'MemoryFlashCore/src/redux/selectors/rhythmSelectors';
import {
	saxFirstNoteSelector,
	saxNoteWindowsSelector,
	saxPitchMatchSelector,
	saxRhythmActiveSelector,
} from 'MemoryFlashCore/src/redux/selectors/saxRhythmSelectors';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { useLatest } from '../../utils/useLatest';

const GRADE_DELAY_MS = 60;

export const useSaxRhythm = () => {
	const dispatch = useAppDispatch();
	const active = useLatest(useAppSelector(saxRhythmActiveSelector));
	const first = useLatest(useAppSelector(saxFirstNoteSelector));
	const windows = useAppSelector(saxNoteWindowsSelector);
	const latestWindows = useLatest(windows);
	const match = useLatest(useAppSelector(saxPitchMatchSelector));
	const graded = useLatest(useAppSelector(currRhythmCardSelector)?.steps);
	const batchId = useAppSelector((s) => s.scheduler.batchId);
	const session = useRef(new SaxRhythmSession());
	const [coverage, setCoverage] = useState(0);

	useEffect(() => session.current.reset(performance.now()), [batchId]);

	const onFrame = (frame: PitchFrame) => {
		session.current.add(frame);
		if (!active.current || !first.current) return;
		const current = latestWindows.current.find((w) => frame.timeMs < w.endMs);
		if (current) {
			setCoverage(session.current.liveCoverage(current, frame.timeMs, match.current));
			return;
		}
		const onset = session.current.anchorOnset(first.current.midis, match.current);
		if (onset !== undefined) dispatch(anchorSaxCard(onset, first.current.beat));
	};

	useEffect(() => {
		const timers = windows.map((w, i) =>
			window.setTimeout(
				() => {
					if (graded.current?.[w.index]) return;
					const grade = session.current.grade(w, match.current);
					dispatch(reportCoverageStep(w.index, grade, i === windows.length - 1));
				},
				w.endMs + GRADE_DELAY_MS - performance.now(),
			),
		);
		return () => timers.forEach((t) => window.clearTimeout(t));
	}, [windows]);

	return { onFrame, coverage };
};

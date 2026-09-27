import { useEffect, useRef, useState } from 'react';
import { calibrationOffsetMs } from 'MemoryFlashCore/src/lib/rhythm/calibrate';
import { saveRhythmLatency } from 'MemoryFlashCore/src/redux/actions/rhythm-actions';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { metronomeClock } from '../metronome/metronomeClock';

const CALIBRATION_BPM = 90;
const CALIBRATION_CLICKS = 10;

export const useCalibration = () => {
	const dispatch = useAppDispatch();
	const [active, setActive] = useState(false);
	const clicks = useRef<number[]>([]);
	const taps = useRef<number[]>([]);
	const notes = useAppSelector((s) => s.midi.notes);
	const seen = useRef(new Set<number>());

	useEffect(() => {
		if (!active) return;
		notes.filter((n) => !seen.current.has(n.time)).forEach((n) => tap(n.time));
		notes.forEach((n) => seen.current.add(n.time));
	}, [notes, active]);

	const tap = (time = performance.now()) => {
		if (active) taps.current.push(time);
	};

	const finish = (startedClock: boolean) => {
		if (startedClock) metronomeClock.stop();
		setActive(false);
		const counted = clicks.current.slice(2);
		const from = counted[0] - 30000 / CALIBRATION_BPM;
		const offset = calibrationOffsetMs(
			counted,
			taps.current.filter((t) => t >= from),
		);
		if (offset !== null) dispatch(saveRhythmLatency(offset));
	};

	const start = () => {
		clicks.current = [];
		taps.current = [];
		seen.current = new Set(notes.map((n) => n.time));
		const startedClock = !metronomeClock.running;
		if (startedClock) metronomeClock.start(CALIBRATION_BPM, () => {});
		setActive(true);
		const unsubscribe = metronomeClock.onClick((perfMs) => {
			clicks.current.push(perfMs);
			if (clicks.current.length < CALIBRATION_CLICKS) return;
			unsubscribe();
			window.setTimeout(() => finish(startedClock), 60000 / CALIBRATION_BPM);
		});
	};

	return { active, start, tap };
};

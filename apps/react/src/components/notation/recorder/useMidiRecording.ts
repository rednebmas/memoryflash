import { useEffect, useRef, useState } from 'react';
import { Grid } from 'MemoryFlashCore/src/lib/rhythm/types';
import { RecordedNote } from 'MemoryFlashCore/src/lib/recording/quantize';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { metronomeClock } from '../../metronome/metronomeClock';

export type Take = { notes: RecordedNote[]; originMs: number; beatMs: number };
type Status = 'idle' | 'count-in' | 'recording';

const EARLY_MS = 80;

export const useMidiRecording = (bpm: number, beatsPerBar: number) => {
	const [status, setStatus] = useState<Status>('idle');
	const [grid, setGrid] = useState<Grid>();
	const notes = useAppSelector((s) => s.midi.notes);
	const open = useRef(new Map<number, number>());
	const taken = useRef<RecordedNote[]>([]);
	const originMs = grid ? grid.originMs + beatsPerBar * grid.beatMs : undefined;

	useEffect(() => {
		if (status === 'idle') return;
		const held = new Set(notes.map((n) => n.number));
		notes.forEach((n) => !open.current.has(n.number) && open.current.set(n.number, n.time));
		open.current.forEach((onMs, midi) => {
			if (held.has(midi)) return;
			taken.current.push({ midi, onMs, offMs: performance.now() });
			open.current.delete(midi);
		});
	}, [notes, status]);

	useEffect(() => {
		if (status !== 'count-in' || originMs === undefined) return;
		const timer = window.setTimeout(() => setStatus('recording'), originMs - performance.now());
		return () => window.clearTimeout(timer);
	}, [status, originMs]);

	const start = () => {
		taken.current = [];
		open.current = new Map(notes.map((n) => [n.number, n.time]));
		setGrid(undefined);
		metronomeClock.setBeatsPerBar(beatsPerBar);
		metronomeClock.start(bpm, (g) => g && setGrid((prev) => prev ?? g));
		setStatus('count-in');
	};

	const stop = (): Take | undefined => {
		metronomeClock.stop();
		setStatus('idle');
		if (!grid || originMs === undefined) return undefined;
		const now = performance.now();
		open.current.forEach((onMs, midi) => taken.current.push({ midi, onMs, offMs: now }));
		open.current.clear();
		const inTake = taken.current.filter((n) => n.onMs >= originMs - EARLY_MS);
		return { notes: inTake, originMs, beatMs: grid.beatMs };
	};

	useEffect(() => () => metronomeClock.stop(), []);

	return { status, start, stop };
};

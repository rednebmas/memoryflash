import React, { useEffect } from 'react';
import { useAppDispatch } from 'MemoryFlashCore/src/redux/store';
import { rhythmActions } from 'MemoryFlashCore/src/redux/slices/rhythmSlice';
import { metronomeClock } from './metronome/metronomeClock';

export const MetronomeSound: React.FC<{ bpm: number; beatsPerBar: number; clicks: number[] }> = ({
	bpm,
	beatsPerBar,
	clicks,
}) => {
	const dispatch = useAppDispatch();

	useEffect(() => {
		metronomeClock.start(bpm, (grid) => dispatch(rhythmActions.setGrid(grid)), clicks);
		return () => metronomeClock.stop();
	}, []);

	useEffect(() => metronomeClock.setBpm(bpm), [bpm]);
	useEffect(() => metronomeClock.setBeatsPerBar(beatsPerBar), [beatsPerBar]);
	useEffect(() => metronomeClock.setClicks(clicks), [clicks]);

	return null;
};

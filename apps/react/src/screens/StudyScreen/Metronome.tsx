import { PauseIcon, PlayIcon } from '@heroicons/react/24/solid';
import React, { useEffect } from 'react';
import { MetronomeSound } from '../../components/MetronomeSound';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { rhythmActions } from 'MemoryFlashCore/src/redux/slices/rhythmSlice';
import {
	currBeatsPerBarSelector,
	deckTempoSelector,
} from 'MemoryFlashCore/src/redux/selectors/rhythmSelectors';

export const Metronome: React.FunctionComponent = () => {
	const dispatch = useAppDispatch();
	const playing = useAppSelector((state) => state.rhythm.metronomePlaying);
	const bpm = useAppSelector(deckTempoSelector);
	const beatsPerBar = useAppSelector(currBeatsPerBarSelector);
	useEffect(() => () => void dispatch(rhythmActions.stopMetronome()), []);

	return (
		<div
			onClick={() => dispatch(rhythmActions.toggleMetronome())}
			title={playing ? undefined : 'Start the metronome to grade your timing'}
		>
			{playing && <MetronomeSound bpm={bpm} beatsPerBar={beatsPerBar} />}
			<div
				className="h-7 w-7 rounded-full flex items-center justify-center bg-blue-500  hover:ring ring-blue-400 ring-2 transition"
				role="button"
			>
				{playing ? (
					<PauseIcon className="h-4 w-4  text-white" />
				) : (
					<PlayIcon
						className="h-4 w-4  text-white"
						style={{
							marginLeft: '0.1rem',
						}}
					/>
				)}
			</div>
		</div>
	);
};

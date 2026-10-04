import { PauseIcon, PlayIcon } from '@heroicons/react/24/solid';
import React, { useState } from 'react';
import { MetronomeSound } from '../../components/MetronomeSound';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import {
	currBeatsPerBarSelector,
	deckTempoSelector,
} from 'MemoryFlashCore/src/redux/selectors/rhythmSelectors';
import { useUpdateEffect } from '../../utils/useUpdateEffect';

export const Metronome: React.FunctionComponent = () => {
	const [playing, setPlaying] = useState(false);
	const bpm = useAppSelector(deckTempoSelector);
	const beatsPerBar = useAppSelector(currBeatsPerBarSelector);
	const onNotes = useAppSelector((state) => state.midi.notes);
	const toggleKeyOn = onNotes.find((note) => note.number === 25);
	useUpdateEffect(() => {
		if (toggleKeyOn) {
			setPlaying(!playing);
		}
	}, [toggleKeyOn]);

	return (
		<div
			onClick={() => {
				setPlaying(!playing);
			}}
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

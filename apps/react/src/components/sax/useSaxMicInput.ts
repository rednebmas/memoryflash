import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { midiActions } from 'MemoryFlashCore/src/redux/slices/midiSlice';
import { saxTypeSelector } from 'MemoryFlashCore/src/redux/selectors/instrumentSelector';
import {
	PitchState,
	frequencyToWrittenMidi,
	initialPitchState,
	stabilizePitch,
} from 'MemoryFlashCore/src/lib/saxPitch';
import { listenForPitch } from './listenForPitch';

export const useSaxMicInput = () => {
	const dispatch = useAppDispatch();
	const saxType = useAppSelector(saxTypeSelector);
	const [heard, setHeard] = useState<number>();
	const [error, setError] = useState<string>();

	useEffect(() => {
		let pitch: PitchState = initialPitchState;
		const onFrame = (frequency?: number) => {
			const midi = frequency ? frequencyToWrittenMidi(frequency, saxType) : undefined;
			const { state, on, off } = stabilizePitch(pitch, midi);
			pitch = state;
			if (off !== undefined) dispatch(midiActions.removeNote(off));
			if (on !== undefined) dispatch(midiActions.addNote(on));
			if (on !== undefined || off !== undefined) setHeard(state.active);
		};
		const stopping = listenForPitch(onFrame).catch(() => {
			setError('Allow microphone access so the app can hear your saxophone.');
		});
		return () => {
			stopping.then((stop) => stop?.());
			if (pitch.active !== undefined) dispatch(midiActions.removeNote(pitch.active));
		};
	}, [saxType]);

	return { heard, error };
};

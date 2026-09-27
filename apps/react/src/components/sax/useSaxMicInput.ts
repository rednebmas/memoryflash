import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { midiActions } from 'MemoryFlashCore/src/redux/slices/midiSlice';
import {
	saxHoldMsSelector,
	saxTypeSelector,
} from 'MemoryFlashCore/src/redux/selectors/instrumentSelector';
import {
	PitchState,
	frequencyToWrittenMidi,
	holdProgress,
	initialPitchState,
	stabilizePitch,
} from 'MemoryFlashCore/src/lib/saxPitch';
import { listenForPitch } from './listenForPitch';

export const useSaxMicInput = () => {
	const dispatch = useAppDispatch();
	const saxType = useAppSelector(saxTypeSelector);
	const holdMsSetting = useAppSelector(saxHoldMsSelector);
	const holdMs = useRef(holdMsSetting);
	holdMs.current = holdMsSetting;
	const [heard, setHeard] = useState<number>();
	const [progress, setProgress] = useState(0);
	const [ready, setReady] = useState(false);
	const [error, setError] = useState<string>();

	useEffect(() => {
		let pitch: PitchState = initialPitchState;
		const onFrame = (frequency?: number) => {
			const midi = frequency ? frequencyToWrittenMidi(frequency, saxType) : undefined;
			const { state, on, off } = stabilizePitch(pitch, midi, holdMs.current);
			pitch = state;
			if (off !== undefined) dispatch(midiActions.removeNote(off));
			if (on !== undefined) dispatch(midiActions.addNote(on));
			setHeard(state.candidate ?? state.active);
			setProgress(holdProgress(state, holdMs.current));
		};
		const stopping = listenForPitch(onFrame, setReady).catch(() => {
			setError('Allow microphone access so the app can hear your saxophone.');
		});
		return () => {
			stopping.then((stop) => stop?.());
			if (pitch.active !== undefined) dispatch(midiActions.removeNote(pitch.active));
		};
	}, [saxType]);

	return { heard, progress, ready, error };
};

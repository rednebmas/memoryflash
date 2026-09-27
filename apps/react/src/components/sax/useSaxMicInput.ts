import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { midiActions } from 'MemoryFlashCore/src/redux/slices/midiSlice';
import {
	currentCardIsNaturalSelector,
	currentNoteMidiSelector,
	saxAnyOctaveSelector,
	saxHoldMsSelector,
	saxTypeSelector,
} from 'MemoryFlashCore/src/redux/selectors/instrumentSelector';
import {
	PitchState,
	foldToOctaveOf,
	frequencyToWrittenMidi,
	holdProgress,
	initialPitchState,
	stabilizePitch,
} from 'MemoryFlashCore/src/lib/saxPitch';
import { listenForPitch } from './listenForPitch';
import { useLatest } from '../../utils/useLatest';
import { PitchFrame } from 'MemoryFlashCore/src/lib/rhythm/types';

export const useSaxMicInput = (onPitchFrame?: (frame: PitchFrame) => void) => {
	const dispatch = useAppDispatch();
	const saxType = useAppSelector(saxTypeSelector);
	const holdMs = useLatest(useAppSelector(saxHoldMsSelector));
	const naturalsOnly = useLatest(useAppSelector(currentCardIsNaturalSelector));
	const anyOctave = useLatest(useAppSelector(saxAnyOctaveSelector));
	const target = useLatest(useAppSelector(currentNoteMidiSelector));
	const mutedUntil = useRef(0);
	const frameListener = useLatest(onPitchFrame);
	const [heard, setHeard] = useState<number>();
	const [progress, setProgress] = useState(0);
	const [ready, setReady] = useState(false);
	const [error, setError] = useState<string>();

	const toWrittenMidi = (frequency: number) => {
		const midi = frequencyToWrittenMidi(frequency, saxType, naturalsOnly.current);
		return foldToOctaveOf(midi, anyOctave.current ? target.current : undefined);
	};
	const muteFor = (ms: number) => {
		mutedUntil.current = Date.now() + ms;
	};

	useEffect(() => {
		let pitch: PitchState = initialPitchState;
		let candidateSince = 0;
		const onFrame = (frequency: number | undefined, timeMs: number) => {
			const muted = Date.now() < mutedUntil.current;
			const midi = frequency && !muted ? toWrittenMidi(frequency) : undefined;
			frameListener.current?.({ timeMs, midi });
			const { state, on, off } = stabilizePitch(pitch, midi, holdMs.current);
			if (state.candidate !== pitch.candidate) candidateSince = timeMs;
			pitch = state;
			if (off !== undefined) dispatch(midiActions.removeNote(off));
			if (on !== undefined)
				dispatch(midiActions.addNote({ number: on, time: candidateSince }));
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

	return { heard, progress, ready, error, muteFor };
};

import { useEffect } from 'react';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import {
	currentNoteMidiSelector,
	saxToneModeSelector,
	saxToneMsSelector,
	saxTypeSelector,
} from 'MemoryFlashCore/src/redux/selectors/instrumentSelector';
import { writtenMidiToFrequency } from 'MemoryFlashCore/src/lib/saxPitch';
import { playTone } from './playTone';
import { rhythmActiveSelector } from 'MemoryFlashCore/src/redux/selectors/rhythmSelectors';

const ECHO_MS = 300;

export const useReferenceTone = (muteFor: (ms: number) => void) => {
	const mode = useAppSelector(saxToneModeSelector);
	const toneMs = useAppSelector(saxToneMsSelector);
	const midi = useAppSelector(currentNoteMidiSelector);
	const saxType = useAppSelector(saxTypeSelector);
	const currCard = useAppSelector((state) => state.scheduler.currCard);
	const rhythmActive = useAppSelector(rhythmActiveSelector);

	const play = () => {
		if (midi === undefined) return;
		if (mode !== 'headphones') muteFor(toneMs + ECHO_MS);
		playTone(writtenMidiToFrequency(midi, saxType), toneMs);
	};

	useEffect(() => {
		if (mode !== 'off' && !rhythmActive) play();
	}, [currCard, mode]);

	return midi === undefined ? undefined : play;
};

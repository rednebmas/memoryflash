import { useEffect } from 'react';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import {
	currentNoteMidiSelector,
	saxReferenceToneSelector,
	saxTypeSelector,
} from 'MemoryFlashCore/src/redux/selectors/instrumentSelector';
import { writtenMidiToFrequency } from 'MemoryFlashCore/src/lib/saxPitch';
import { playTone } from './playTone';

const TONE_MS = 1000;
const ECHO_MS = 300;

export const useReferenceTone = (muteFor: (ms: number) => void) => {
	const enabled = useAppSelector(saxReferenceToneSelector);
	const midi = useAppSelector(currentNoteMidiSelector);
	const saxType = useAppSelector(saxTypeSelector);
	const currCard = useAppSelector((state) => state.scheduler.currCard);

	const play = () => {
		if (midi === undefined) return;
		muteFor(TONE_MS + ECHO_MS);
		playTone(writtenMidiToFrequency(midi, saxType), TONE_MS);
	};

	useEffect(() => {
		if (enabled) play();
	}, [currCard, enabled]);

	return midi === undefined ? undefined : play;
};

import React, { useEffect, useRef } from 'react';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { Midi } from 'tonal';

export const PianoSound: React.FC = () => {
	const audioContextRef = useRef<AudioContext | null>(null);
	const activeNotesRef = useRef<Map<number, OscillatorNode>>(new Map());
	const onNotes = useAppSelector((state) => state.midi.notes);
	const pianoSamplesEnabled = useAppSelector((state) => state.midi.pianoSamplesEnabled);

	useEffect(() => {
		audioContextRef.current = new AudioContext();

		return () => {
			activeNotesRef.current.forEach((oscillator) => {
				try {
					oscillator.stop();
				} catch (e) {}
			});
			activeNotesRef.current.clear();
		};
	}, []);

	useEffect(() => {
		if (!pianoSamplesEnabled || !audioContextRef.current) return;

		const currentNoteNumbers = new Set(onNotes.map((n) => n.number));
		const activeNoteNumbers = new Set(activeNotesRef.current.keys());

		activeNoteNumbers.forEach((noteNumber) => {
			if (!currentNoteNumbers.has(noteNumber)) {
				const oscillator = activeNotesRef.current.get(noteNumber);
				if (oscillator) {
					try {
						oscillator.stop();
					} catch (e) {}
					activeNotesRef.current.delete(noteNumber);
				}
			}
		});

		currentNoteNumbers.forEach((noteNumber) => {
			if (!activeNoteNumbers.has(noteNumber)) {
				const frequency = Midi.midiToFreq(noteNumber);
				const oscillator = audioContextRef.current!.createOscillator();
				const gainNode = audioContextRef.current!.createGain();

				oscillator.type = 'sine';
				oscillator.frequency.setValueAtTime(
					frequency,
					audioContextRef.current!.currentTime,
				);

				gainNode.gain.setValueAtTime(0.3, audioContextRef.current!.currentTime);
				gainNode.gain.exponentialRampToValueAtTime(
					0.01,
					audioContextRef.current!.currentTime + 1.5,
				);

				oscillator.connect(gainNode);
				gainNode.connect(audioContextRef.current!.destination);

				oscillator.start();
				activeNotesRef.current.set(noteNumber, oscillator);
			}
		});
	}, [onNotes, pianoSamplesEnabled]);

	return null;
};

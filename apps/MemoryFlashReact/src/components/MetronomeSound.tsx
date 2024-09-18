import React, { useEffect, useRef } from 'react';

const click1 = '/kick-getting-laid.wav';
const click2 = '/tick.wav';

type MetronomeProps = {
	bpm: number;
	beatsPerMeasure?: number;
};

let count = 0;

export const MetronomeSound: React.FC<MetronomeProps> = ({ bpm, beatsPerMeasure = 4 }) => {
	const audioContextRef = useRef<AudioContext | null>(null);
	const nextNoteTimeRef = useRef(0);
	const timerRef = useRef<number | null>(null);
	const currentBPMRef = useRef<number>(bpm); // to track BPM changes

	const scheduleNote = (time: number, noteType: number) => {
		const source = audioContextRef.current!.createBufferSource();
		source.buffer = noteType === 0 ? click1BufferRef.current : click2BufferRef.current;
		source.connect(audioContextRef.current!.destination);
		source.start(time);
	};

	const playClick = () => {
		while (nextNoteTimeRef.current < audioContextRef.current!.currentTime + 0.1) {
			const isBeat = count % beatsPerMeasure === 0;
			scheduleNote(nextNoteTimeRef.current, isBeat ? 1 : 0);
			nextNoteTimeRef.current += 60 / currentBPMRef.current;
			count = count + 1;
		}
	};

	const click1BufferRef = useRef<AudioBuffer | null>(null);
	const click2BufferRef = useRef<AudioBuffer | null>(null);

	// Fetch and decode audio files
	useEffect(() => {
		count = 0;
		audioContextRef.current = new AudioContext();

		const fetchSound = async (audioUrl: string) => {
			const response = await fetch(audioUrl);
			const arrayBuffer = await response.arrayBuffer();
			return audioContextRef.current!.decodeAudioData(arrayBuffer);
		};

		fetchSound(click1).then((buffer) => (click1BufferRef.current = buffer));
		fetchSound(click2).then((buffer) => (click2BufferRef.current = buffer));

		nextNoteTimeRef.current = audioContextRef.current!.currentTime;
		timerRef.current = window.setInterval(playClick, 50);

		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		};
	}, []);

	useEffect(() => {
		currentBPMRef.current = bpm;
	}, [bpm]);

	return null; // This component has no UI, only produces sound
};

// https://chatgpt.com/share/fbb7f988-418f-4552-bd47-dc73829249d3
// https://codesandbox.io/p/sandbox/react-metronome-demo-4w9m1?file=%2Fsrc%2FMetronome.js%3A5%2C56

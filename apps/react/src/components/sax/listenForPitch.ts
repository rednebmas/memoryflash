import { PitchDetector } from 'pitchy';
import { FRAME_MS } from 'MemoryFlashCore/src/lib/saxPitch';

const MIN_CLARITY = 0.9;
const MIN_RMS = 0.01;
const GESTURES = ['pointerdown', 'keydown'] as const;

const rms = (buffer: Float32Array) =>
	Math.sqrt(buffer.reduce((sum, v) => sum + v * v, 0) / buffer.length);

const resumeOnGesture = (context: AudioContext, onReady: (ready: boolean) => void) => {
	const resume = () => context.resume();
	context.onstatechange = () => onReady(context.state === 'running');
	onReady(context.state === 'running');
	resume();
	GESTURES.forEach((g) => document.addEventListener(g, resume));
	return () => GESTURES.forEach((g) => document.removeEventListener(g, resume));
};

export async function listenForPitch(
	onFrame: (frequency?: number) => void,
	onReady: (ready: boolean) => void,
) {
	if (navigator.audioSession) navigator.audioSession.type = 'play-and-record';
	const stream = await navigator.mediaDevices.getUserMedia({
		audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
	});
	const context = new AudioContext();
	const stopResuming = resumeOnGesture(context, onReady);
	const analyser = context.createAnalyser();
	analyser.fftSize = 2048;
	context.createMediaStreamSource(stream).connect(analyser);
	const detector = PitchDetector.forFloat32Array(analyser.fftSize);
	const buffer = new Float32Array(analyser.fftSize);

	const interval = setInterval(() => {
		analyser.getFloatTimeDomainData(buffer);
		const [frequency, clarity] = detector.findPitch(buffer, context.sampleRate);
		onFrame(clarity >= MIN_CLARITY && rms(buffer) >= MIN_RMS ? frequency : undefined);
	}, FRAME_MS);

	return () => {
		clearInterval(interval);
		stopResuming();
		stream.getTracks().forEach((track) => track.stop());
		context.close();
		if (navigator.audioSession) navigator.audioSession.type = 'auto';
	};
}

import { PitchDetector } from 'pitchy';

const MIN_CLARITY = 0.9;
const MIN_RMS = 0.01;
const FRAME_MS = 1000 / 60;

const rms = (buffer: Float32Array) =>
	Math.sqrt(buffer.reduce((sum, v) => sum + v * v, 0) / buffer.length);

export async function listenForPitch(onFrame: (frequency?: number) => void) {
	const stream = await navigator.mediaDevices.getUserMedia({
		audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
	});
	const context = new AudioContext();
	await context.resume();
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
		stream.getTracks().forEach((track) => track.stop());
		context.close();
	};
}

import { diagnostics, errorMessage } from './diagnostics';

const GESTURES = ['pointerdown', 'keydown', 'touchend'] as const;

let context: AudioContext | undefined;

const playThroughSilentMode = () => {
	if (navigator.audioSession?.type === 'auto') navigator.audioSession.type = 'playback';
};

const describe = (ctx: AudioContext) =>
	`state=${ctx.state} currentTime=${ctx.currentTime.toFixed(2)} session=${navigator.audioSession?.type ?? 'n/a'}`;

const createContext = () => {
	const ctx = new AudioContext();
	diagnostics.log(
		'audio',
		`created sampleRate=${ctx.sampleRate} channels=${ctx.destination.maxChannelCount} ${describe(ctx)}`,
	);
	ctx.addEventListener('statechange', () =>
		diagnostics.log('audio', `statechange ${describe(ctx)}`),
	);
	diagnostics.snapshot('audio', () => describe(ctx));
	return ctx;
};

export const getAudioContext = (): AudioContext => {
	playThroughSilentMode();
	context ??= createContext();
	context.resume().catch((e) => diagnostics.log('audio', `resume failed ${errorMessage(e)}`));
	return context;
};

const unlockAudio = () => {
	if (getAudioContext().state !== 'running') return;
	GESTURES.forEach((g) => document.removeEventListener(g, unlockAudio, true));
};

GESTURES.forEach((g) => document.addEventListener(g, unlockAudio, true));

export const contextTimeToPerfMs = (ctx: AudioContext, time: number): number => {
	const stamp = ctx.getOutputTimestamp?.();
	if (stamp?.contextTime !== undefined && stamp.performanceTime !== undefined) {
		return stamp.performanceTime + (time - stamp.contextTime) * 1000;
	}
	return performance.now() + (time - ctx.currentTime + (ctx.outputLatency ?? 0)) * 1000;
};

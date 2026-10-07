import { diagnostics, errorMessage } from './diagnostics';

const GESTURES = ['pointerdown', 'keydown', 'touchend'] as const;

let context: AudioContext | undefined;

const playThroughSilentMode = () => {
	if (navigator.audioSession?.type === 'auto') navigator.audioSession.type = 'playback';
};

const describeSession = () => {
	const session = navigator.audioSession;
	return session ? `session=${session.type}/${session.state ?? '?'}` : 'session=n/a';
};

const describe = (ctx: AudioContext) =>
	`state=${ctx.state} currentTime=${ctx.currentTime.toFixed(2)} ${describeSession()} outputLatency=${ctx.outputLatency?.toFixed(3)} baseLatency=${ctx.baseLatency?.toFixed(3)} channels=${ctx.destination.channelCount}/${ctx.destination.maxChannelCount}`;

const createContext = () => {
	const ctx = new AudioContext();
	diagnostics.log('audio', `created sampleRate=${ctx.sampleRate} ${describe(ctx)}`);
	ctx.addEventListener('statechange', () =>
		diagnostics.log('audio', `statechange ${describe(ctx)}`),
	);
	navigator.audioSession?.addEventListener('statechange', () =>
		diagnostics.log('audio', `session statechange ${describe(ctx)}`),
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

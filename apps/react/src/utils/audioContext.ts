const GESTURES = ['pointerdown', 'keydown', 'touchend'] as const;

let context: AudioContext | undefined;

const playThroughSilentMode = () => {
	if (navigator.audioSession?.type === 'auto') navigator.audioSession.type = 'playback';
};

export const getAudioContext = (): AudioContext => {
	playThroughSilentMode();
	context ??= new AudioContext();
	context.resume();
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

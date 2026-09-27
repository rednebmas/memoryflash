let context: AudioContext | undefined;

export const getAudioContext = (): AudioContext => {
	context ??= new AudioContext();
	context.resume();
	return context;
};

export const contextTimeToPerfMs = (ctx: AudioContext, time: number): number => {
	const stamp = ctx.getOutputTimestamp?.();
	if (stamp?.contextTime !== undefined && stamp.performanceTime !== undefined) {
		return stamp.performanceTime + (time - stamp.contextTime) * 1000;
	}
	return performance.now() + (time - ctx.currentTime + (ctx.outputLatency ?? 0)) * 1000;
};

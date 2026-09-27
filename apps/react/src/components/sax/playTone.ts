let context: AudioContext | undefined;

const FADE_S = 0.03;
const VOLUME = 0.3;

export function playTone(frequency: number, ms: number) {
	context ??= new AudioContext();
	context.resume();
	const start = context.currentTime;
	const end = start + ms / 1000;
	const oscillator = context.createOscillator();
	const gain = context.createGain();
	oscillator.type = 'triangle';
	oscillator.frequency.value = frequency;
	gain.gain.setValueAtTime(0, start);
	gain.gain.linearRampToValueAtTime(VOLUME, start + FADE_S);
	gain.gain.setValueAtTime(VOLUME, end - FADE_S);
	gain.gain.linearRampToValueAtTime(0, end);
	oscillator.connect(gain).connect(context.destination);
	oscillator.start(start);
	oscillator.stop(end);
}

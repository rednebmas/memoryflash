import { Grid } from 'MemoryFlashCore/src/lib/rhythm/types';
import { contextTimeToPerfMs, getAudioContext } from '../../utils/audioContext';

const SOUNDS = { accent: '/kick-getting-laid.wav', beat: '/tick.wav' };
const BEATS_PER_BAR = 4;
const LOOKAHEAD_S = 0.1;
const TICK_MS = 25;
const DRIFT_MS = 2;

type Buffers = { accent: AudioBuffer; beat: AudioBuffer };
type GridListener = (grid: Grid | undefined) => void;
type ClickListener = (perfMs: number) => void;

const loadBuffer = async (ctx: AudioContext, url: string) =>
	ctx.decodeAudioData(await (await fetch(url)).arrayBuffer());

class MetronomeClock {
	private buffers?: Promise<Buffers>;
	private timer?: number;
	private nextTime = 0;
	private count = 0;
	private bpm = 60;
	private grid?: Grid;
	private onGrid?: GridListener;
	private clickListeners = new Set<ClickListener>();

	async start(bpm: number, onGrid: GridListener) {
		this.stop();
		const ctx = getAudioContext();
		this.bpm = bpm;
		this.onGrid = onGrid;
		this.buffers ??= Promise.all([
			loadBuffer(ctx, SOUNDS.accent),
			loadBuffer(ctx, SOUNDS.beat),
		]).then(([accent, beat]) => ({ accent, beat }));
		const buffers = await this.buffers;
		if (this.onGrid !== onGrid) return;
		this.count = 0;
		this.nextTime = ctx.currentTime + LOOKAHEAD_S;
		this.timer = window.setInterval(() => this.schedule(ctx, buffers), TICK_MS);
	}

	stop() {
		if (this.timer) window.clearInterval(this.timer);
		this.timer = undefined;
		this.grid = undefined;
		this.onGrid?.(undefined);
		this.onGrid = undefined;
	}

	get running() {
		return this.timer !== undefined;
	}

	setBpm(bpm: number) {
		this.bpm = bpm;
	}

	onClick(listener: ClickListener) {
		this.clickListeners.add(listener);
		return () => this.clickListeners.delete(listener);
	}

	private schedule(ctx: AudioContext, buffers: Buffers) {
		while (this.nextTime < ctx.currentTime + LOOKAHEAD_S) {
			const source = ctx.createBufferSource();
			source.buffer = this.count % BEATS_PER_BAR === 0 ? buffers.accent : buffers.beat;
			source.connect(ctx.destination);
			source.start(this.nextTime);
			this.emitClick(contextTimeToPerfMs(ctx, this.nextTime));
			this.nextTime += 60 / this.bpm;
			this.count += 1;
		}
	}

	private emitClick(perfMs: number) {
		const beatMs = 60000 / this.bpm;
		this.clickListeners.forEach((listener) => listener(perfMs));
		if (this.grid && this.grid.beatMs === beatMs) {
			const drift = Math.abs(perfMs - this.grid.originMs) % beatMs;
			if (Math.min(drift, beatMs - drift) <= DRIFT_MS) return;
		}
		this.grid = { originMs: perfMs, beatMs };
		this.onGrid?.(this.grid);
	}
}

export const metronomeClock = new MetronomeClock();

import { Grid } from 'MemoryFlashCore/src/lib/rhythm/types';
import { contextTimeToPerfMs, getAudioContext } from '../../utils/audioContext';
import { diagnostics, errorMessage } from '../../utils/diagnostics';

const SOUNDS = { accent: '/kick-getting-laid.wav', beat: '/tick.wav' };
const LOOKAHEAD_S = 0.1;
const TICK_MS = 25;
const DRIFT_MS = 2;

type Buffers = { accent: AudioBuffer; beat: AudioBuffer };
type GridListener = (grid: Grid | undefined) => void;
type ClickListener = (perfMs: number) => void;

const loadBuffer = async (ctx: AudioContext, url: string) => {
	const res = await fetch(url);
	const bytes = await res.arrayBuffer();
	diagnostics.log('metronome', `fetched ${url} status=${res.status} bytes=${bytes.byteLength}`);
	const buffer = await ctx.decodeAudioData(bytes);
	diagnostics.log('metronome', `decoded ${url} duration=${buffer.duration.toFixed(3)}s`);
	return buffer;
};

class MetronomeClock {
	private buffers?: Promise<Buffers>;
	private timer?: number;
	private nextTime = 0;
	private count = 0;
	private bpm = 60;
	private beatsPerBar = 4;
	private grid?: Grid;
	private onGrid?: GridListener;
	private clickListeners = new Set<ClickListener>();
	private started?: { ctx: AudioContext; ctxTime: number; perfMs: number };

	constructor() {
		diagnostics.snapshot('metronome', () => this.describe());
	}

	async start(bpm: number, onGrid: GridListener) {
		this.stop();
		const ctx = getAudioContext();
		this.bpm = bpm;
		this.onGrid = onGrid;
		this.buffers ??= Promise.all([
			loadBuffer(ctx, SOUNDS.accent),
			loadBuffer(ctx, SOUNDS.beat),
		]).then(([accent, beat]) => ({ accent, beat }));
		const buffers = await this.buffers.catch((e) => {
			diagnostics.log('metronome', `load failed ${errorMessage(e)}`);
		});
		if (!buffers || this.onGrid !== onGrid) return;
		this.count = 0;
		this.nextTime = ctx.currentTime + LOOKAHEAD_S;
		this.timer = window.setInterval(() => this.schedule(ctx, buffers), TICK_MS);
		this.started = { ctx, ctxTime: ctx.currentTime, perfMs: performance.now() };
		diagnostics.log('metronome', `timer started bpm=${bpm} ctx ${ctx.state}`);
	}

	stop() {
		if (this.timer) {
			diagnostics.log('metronome', `stopped after ${this.count} clicks`);
			window.clearInterval(this.timer);
		}
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

	setBeatsPerBar(beats: number) {
		this.beatsPerBar = beats;
	}

	onClick(listener: ClickListener) {
		this.clickListeners.add(listener);
		return () => this.clickListeners.delete(listener);
	}

	private schedule(ctx: AudioContext, buffers: Buffers) {
		while (this.nextTime < ctx.currentTime + LOOKAHEAD_S) {
			const source = ctx.createBufferSource();
			const beatInBar = this.count % this.beatsPerBar;
			source.buffer = beatInBar === 0 ? buffers.accent : buffers.beat;
			source.connect(ctx.destination);
			source.start(this.nextTime);
			this.emitClick(contextTimeToPerfMs(ctx, this.nextTime), beatInBar);
			this.nextTime += 60 / this.bpm;
			this.count += 1;
		}
	}

	private describe() {
		if (!this.started) return 'never started';
		const { ctx, ctxTime, perfMs } = this.started;
		const ctxElapsed = ctx.currentTime - ctxTime;
		const wallElapsed = (performance.now() - perfMs) / 1000;
		return `running=${this.running} clicks=${this.count} since start: ctx ${ctxElapsed.toFixed(1)}s vs wall ${wallElapsed.toFixed(1)}s`;
	}

	private emitClick(perfMs: number, beatInBar: number) {
		const beatMs = 60000 / this.bpm;
		const barMs = beatMs * this.beatsPerBar;
		this.clickListeners.forEach((listener) => listener(perfMs));
		if (this.grid && this.grid.beatMs === beatMs && this.grid.barMs === barMs) {
			const drift = Math.abs(perfMs - this.grid.originMs) % beatMs;
			if (Math.min(drift, beatMs - drift) <= DRIFT_MS) return;
		}
		this.grid = { originMs: perfMs - beatInBar * beatMs, beatMs, barMs };
		this.onGrid?.(this.grid);
	}
}

export const metronomeClock = new MetronomeClock();

import { findAnchorOnset, gradeCoverage, NoteWindow, PitchMatch } from './coverage';
import { PitchFrame, StepGrade } from './types';

const KEEP_MS = 30000;

export class SaxRhythmSession {
	private frames: PitchFrame[] = [];
	private sinceMs = -Infinity;

	reset(sinceMs: number) {
		this.sinceMs = sinceMs;
	}

	add(frame: PitchFrame) {
		this.frames.push(frame);
		const cutoff = frame.timeMs - KEEP_MS;
		if (this.frames[0].timeMs < cutoff)
			this.frames = this.frames.filter((f) => f.timeMs >= cutoff);
	}

	anchorOnset(midis: number[], match?: PitchMatch): number | undefined {
		const recent = this.frames.filter((f) => f.timeMs >= this.sinceMs);
		return findAnchorOnset(recent, midis, match);
	}

	grade(window: NoteWindow, match?: PitchMatch): StepGrade {
		return gradeCoverage(this.frames, window, match);
	}

	liveCoverage(window: NoteWindow, nowMs: number, match?: PitchMatch): number {
		if (nowMs <= window.startMs) return 0;
		const partial = { ...window, endMs: Math.min(nowMs, window.endMs) };
		return gradeCoverage(this.frames, partial, match).coverage ?? 0;
	}
}

import { Duration } from './measure';
import { Score, Staff } from './score';
import { NoteTie } from '../types/MultiSheetCard';
import { SheetNote } from '../types/MultiSheetCard';
import { StaffEnum } from '../types/Cards';

export class StepTimeController {
	public durations: Duration[];
	public staff: Staff;
	public voice: number;
	private rest: boolean;
	constructor(
		public score = new Score(),
		duration: Duration | Duration[] = 'q',
	) {
		this.durations = Array.isArray(duration) ? [...duration] : [duration];
		this.staff = StaffEnum.Treble;
		this.voice = 0;
		this.rest = false;
	}
	setDuration(d: Duration | Duration[]): void {
		this.durations = Array.isArray(d) ? [...d] : [d];
	}
	private buildTie(index: number, total: number, length: number): NoteTie | undefined {
		if (!length || total === 1) return undefined;
		const tie: NoteTie = {};
		if (index > 0) tie.fromPrevious = Array.from({ length }, (_, i) => i);
		if (index < total - 1) tie.toNext = Array.from({ length }, (_, i) => i);
		if (!tie.fromPrevious && !tie.toNext) return undefined;
		return tie;
	}
	setStaff(s: Staff): void {
		this.staff = s;
	}
	setVoice(v: number): void {
		this.voice = v;
	}
	setRestMode(r: boolean): void {
		this.rest = r;
	}
	input(notes: SheetNote[]): void {
		if (this.rest || notes.length === 0) {
			for (const duration of this.durations) {
				this.score.addRest(this.staff, duration, this.voice);
			}
			return;
		}
		const total = this.durations.length;
		const chordSize = notes.length;
		this.durations.forEach((duration, index) =>
			this.score.addNote(
				this.staff,
				notes,
				duration,
				this.voice,
				this.buildTie(index, total, chordSize),
			),
		);
	}
}

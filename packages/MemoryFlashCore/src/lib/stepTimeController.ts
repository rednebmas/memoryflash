import { Duration } from './measure';
import { Score, Staff } from './score';
import { SheetNote } from '../types/MultiSheetCard';
import { StaffEnum } from '../types/Cards';

export class StepTimeController {
	private duration: Duration;
	private staff: Staff;
	private voice: number;
	private rest: boolean;
	constructor(
		public score = new Score(),
		duration: Duration = 'q',
	) {
		this.duration = duration;
		this.staff = StaffEnum.Treble;
		this.voice = 0;
		this.rest = false;
	}
	setDuration(d: Duration): void {
		this.duration = d;
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
			this.score.addRest(this.staff, this.duration, this.voice);
			return;
		}
		this.score.addNote(this.staff, notes, this.duration, this.voice);
	}
}

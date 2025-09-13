import { durationBeats, Duration } from './measure';
import { SheetNote } from '../types/MultiSheetCard';
import { StaffEnum } from '../types/Cards';

export type Staff = StaffEnum.Treble | StaffEnum.Bass;

export type ScoreEvent =
	| { type: 'note'; notes: SheetNote[]; duration: Duration }
	| { type: 'rest'; duration: Duration };

export interface ScoreVoice {
	events: ScoreEvent[];
	beat: number;
}

export interface ScoreStaff {
	voices: ScoreVoice[];
}

export interface ScoreMeasure {
	[StaffEnum.Treble]: ScoreStaff;
	[StaffEnum.Bass]: ScoreStaff;
}

const createVoice = (): ScoreVoice => ({ events: [], beat: 0 });
const createStaff = (): ScoreStaff => ({ voices: [createVoice()] });
const createMeasure = (): ScoreMeasure => ({
	[StaffEnum.Treble]: createStaff(),
	[StaffEnum.Bass]: createStaff(),
});

export class Score {
	public measures: ScoreMeasure[] = [];
	constructor(public beatsPerMeasure = 4) {
		this.measures.push(createMeasure());
	}
	private getVoice(staff: Staff, index: number): ScoreVoice {
		const m = this.measures[this.measures.length - 1];
		const v = m[staff].voices;
		while (v.length <= index) v.push(createVoice());
		return v[index];
	}
	private pushMeasure(): void {
		this.measures.push(createMeasure());
	}
	addNote(staff: Staff, notes: SheetNote[], duration: Duration, voice = 0): void {
		const beats = durationBeats[duration];
		const v = this.getVoice(staff, voice);
		if (v.beat + beats > this.beatsPerMeasure) {
			this.pushMeasure();
			this.addNote(staff, notes, duration, voice);
			return;
		}
		v.events.push({ type: 'note', notes, duration });
		v.beat += beats;
	}
	addRest(staff: Staff, duration: Duration, voice = 0): void {
		const beats = durationBeats[duration];
		const v = this.getVoice(staff, voice);
		if (v.beat + beats > this.beatsPerMeasure) {
			this.pushMeasure();
			this.addRest(staff, duration, voice);
			return;
		}
		v.events.push({ type: 'rest', duration });
		v.beat += beats;
	}
}

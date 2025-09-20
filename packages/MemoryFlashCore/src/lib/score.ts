import { durationBeats, Duration } from './measure';
import { NoteTie, SheetNote } from '../types/MultiSheetCard';
import { StaffEnum } from '../types/Cards';

export type Staff = StaffEnum.Treble | StaffEnum.Bass;

export type ScoreEvent =
	| { type: 'note'; notes: SheetNote[]; duration: Duration; tie?: NoteTie }
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

const cloneTie = (tie?: NoteTie): NoteTie | undefined =>
	tie
		? {
				toNext: tie.toNext ? [...tie.toNext] : undefined,
				fromPrevious: tie.fromPrevious ? [...tie.fromPrevious] : undefined,
			}
		: undefined;

export class Score {
	public measures: ScoreMeasure[] = [];
	constructor(public beatsPerMeasure = 4) {
		this.measures.push(createMeasure());
	}
	private getVoice(staff: Staff, index: number, requiredBeats = 0): ScoreVoice {
		for (const measure of this.measures) {
			const voices = measure[staff].voices;
			while (voices.length <= index) voices.push(createVoice());
			const voice = voices[index];
			if (voice.beat + requiredBeats <= this.beatsPerMeasure) {
				return voice;
			}
		}
		this.pushMeasure();
		return this.getVoice(staff, index, requiredBeats);
	}
	private pushMeasure(): void {
		this.measures.push(createMeasure());
	}
	addNote(staff: Staff, notes: SheetNote[], duration: Duration, voice = 0, tie?: NoteTie): void {
		const beats = durationBeats[duration];
		const v = this.getVoice(staff, voice, beats);
		v.events.push({ type: 'note', notes, duration, tie });
		v.beat += beats;
	}
	addRest(staff: Staff, duration: Duration, voice = 0): void {
		const beats = durationBeats[duration];
		const v = this.getVoice(staff, voice, beats);
		v.events.push({ type: 'rest', duration });
		v.beat += beats;
	}
	clone(): Score {
		const s = new Score(this.beatsPerMeasure);
		s.measures = this.measures.map((m) => ({
			[StaffEnum.Treble]: {
				voices: m[StaffEnum.Treble].voices.map((v) => ({
					events: v.events.map((e) =>
						e.type === 'note'
							? {
									type: 'note',
									notes: [...e.notes],
									duration: e.duration,
									tie: cloneTie(e.tie),
								}
							: { type: 'rest', duration: e.duration },
					),
					beat: v.beat,
				})),
			},
			[StaffEnum.Bass]: {
				voices: m[StaffEnum.Bass].voices.map((v) => ({
					events: v.events.map((e) =>
						e.type === 'note'
							? {
									type: 'note',
									notes: [...e.notes],
									duration: e.duration,
									tie: cloneTie(e.tie),
								}
							: { type: 'rest', duration: e.duration },
					),
					beat: v.beat,
				})),
			},
		}));
		return s;
	}
}

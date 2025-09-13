import { Score, ScoreMeasure } from './score';
import { MultiSheetQuestion, StackedNotes } from '../types/MultiSheetCard';
import { StaffEnum } from '../types/Cards';
import { createRestDurations, durationBeats } from './measure';

type Staff = StaffEnum.Treble | StaffEnum.Bass;

function buildStack(
	measures: ScoreMeasure[],
	staff: Staff,
	beatsPerMeasure: number,
): StackedNotes[] {
	const stack: StackedNotes[] = [];
	for (const m of measures) {
		const voice = m[staff].voices[0];
		let beat = 0;
		if (voice) {
			for (const e of voice.events) {
				if (e.type === 'note') stack.push({ notes: e.notes, duration: e.duration });
				else stack.push({ notes: [], duration: e.duration, rest: true });
				beat += durationBeats[e.duration];
			}
		}
		if (beat < beatsPerMeasure) stack.push(...createRestDurations(beatsPerMeasure - beat));
	}
	return stack;
}

export function scoreToQuestion(score: Score, key: string): MultiSheetQuestion {
	const voices = [] as MultiSheetQuestion['voices'];
	for (const staff of [StaffEnum.Treble, StaffEnum.Bass] as Staff[]) {
		const stack = buildStack(score.measures, staff, score.beatsPerMeasure);
		if (stack.some((s) => s.notes.length) || (!voices.length && staff === StaffEnum.Treble))
			voices.push({ staff, stack });
	}
	return { key, voices };
}

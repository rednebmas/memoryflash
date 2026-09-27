import { AnswerType, Card, CardTypeEnum } from '../../types/Cards';
import { MultiSheetQuestion } from '../../types/MultiSheetCard';
import { buildScoreTimeline } from '../scoreTimeline';

const exactStepBeats = (question: MultiSheetQuestion): (number | null)[] => {
	return buildScoreTimeline(question).beats.slice(0, -1);
};

const chordStepBeats = (question: MultiSheetQuestion, chordCount: number): (number | null)[] => {
	const { events } = buildScoreTimeline(question);
	const starts = Array.from(new Set(events.map((e) => e.start))).sort((a, b) => a - b);
	return starts.length === chordCount ? starts : Array(chordCount).fill(null);
};

export function stepBeats(card: Card): (number | null)[] {
	if (card.type !== CardTypeEnum.MultiSheet) return [];
	const { answer, question } = card;
	if (answer.type === AnswerType.ChordMemory && 'chords' in answer) {
		return chordStepBeats(question, answer.chords.length);
	}
	if (answer.type === AnswerType.ExactMulti) return exactStepBeats(question);
	return [];
}

export const hasRhythm = (beats: (number | null)[]) => beats.some((b) => b !== null);

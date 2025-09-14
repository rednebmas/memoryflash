import { buildNoteTimeline } from './tieUtils';
import { MultiSheetCard } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { CardTypeEnum, AnswerType, StaffEnum } from 'MemoryFlashCore/src/types/Cards';

describe('buildNoteTimeline', () => {
	it('handles rests and sustained notes', () => {
		const card: MultiSheetCard = {
			uid: '1',
			type: CardTypeEnum.MultiSheet,
			question: {
				key: 'G',
				voices: [
					{
						staff: StaffEnum.Treble,
						stack: [
							{ notes: [], duration: 'q', rest: true },
							{ notes: [{ name: 'B', octave: 3 }], duration: '16' },
							{ notes: [{ name: 'A', octave: 3 }], duration: '8' },
							{ notes: [{ name: 'G', octave: 3 }], duration: '8' },
							{ notes: [{ name: 'E', octave: 3 }], duration: '16' },
							{ notes: [{ name: 'D', octave: 3 }], duration: 'qd' },
						],
					},
					{
						staff: StaffEnum.Bass,
						stack: [
							{ notes: [{ name: 'G', octave: 2 }], duration: 'hd' },
							{ notes: [{ name: 'G', octave: 2 }], duration: 'q' },
						],
					},
				],
				presentationModes: [],
			},
			answer: { type: AnswerType.ExactMulti },
		};

		const timeline = buildNoteTimeline(card);
		expect(timeline).toHaveLength(7);
		expect(timeline[0]).toEqual({ startNotes: [43], carryNotes: [], releaseNotes: [] });
		expect(timeline[1]).toEqual({ startNotes: [59], carryNotes: [43], releaseNotes: [59] });
		expect(timeline[5]).toEqual({ startNotes: [50], carryNotes: [43], releaseNotes: [43] });
	});
});

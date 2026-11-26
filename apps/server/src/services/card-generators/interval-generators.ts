import { Interval, Note } from 'tonal';
import {
	AnswerType,
	BasicSheetCard,
	CardTypeEnum,
	IntervalCard,
	StaffEnum,
} from 'MemoryFlashCore/src/types/Cards';
import { DeckWithoutGeneratedFields as IDeck } from 'MemoryFlashCore/src/types/Deck';
import { notes, uniqueNotes } from 'MemoryFlashCore/src/lib/notes';
import { transposeDown } from 'MemoryFlashCore/src/lib/transpose-down';
import { zipVariedLengths } from 'MemoryFlashCore/src/lib/zip-varied-lengths';
import { findOrCreateSystemCourse, upsertCourse } from './upsert-course';

export const trebleRange = {
	min: Note.get('c3'),
	max: Note.get('b6'),
	minMidi: Note.get('c3').midi!,
	maxMidi: Note.get('b6').midi!,
};
export const bassRange = {
	min: Note.get('e1'),
	max: Note.get('b4'),
	minMidi: Note.get('e1').midi!,
	maxMidi: Note.get('b4').midi!,
};

export async function generateIntervalsCourse() {
	const course = await findOrCreateSystemCourse('Intervals');
	const deck: IDeck = {
		uid: 'interval note names',
		courseId: course.id,
		name: 'All Intervals',
		section: 'Note Names',
		sectionSubtitle: '',
		tags: [],
	};
	return upsertCourse(course, [[deck, generateIntervalCards().noteNameCards]]);
}

export function generateIntervalCards() {
	const intervalsInPreferredOrder = [
		'P5',
		'M3',
		'm3',
		'P4',
		'm2',
		'M2',
		'm6',
		'M6',
		'm7',
		'M7',
		'd5',
	];

	let noteNameCards: IntervalCard[] = [];
	let bassSheetCards: { [interval: string]: BasicSheetCard[] } = {};
	let trebleSheetCards: { [interval: string]: BasicSheetCard[] } = {};

	const addSheetCards = (noteName: string, interval: string) => {
		const intervalCards: BasicSheetCard[] = [];
		(['Treble', 'Bass'] as StaffEnum[]).forEach((staff) => {
			const range = staff === StaffEnum.Treble ? trebleRange : bassRange;

			[5, 4, 3, 6, 1, 2, 3, 4, 5, 6].forEach((octave) => {
				const note = Note.get(`${noteName}${octave}`);

				function withinRange(aNote: typeof note) {
					if (!aNote.midi) return false;
					return aNote.midi >= range.minMidi && aNote.midi <= range.maxMidi;
				}
				if (!withinRange(note)) return;

				const transposedUp = Note.get(Note.transpose(note.name, interval));
				const transposedDown = Note.get(transposeDown(note.name, interval));

				if (
					transposedUp &&
					!transposedUp.name.includes('##') &&
					!transposedUp.name.includes('bb') &&
					withinRange(transposedUp)
				) {
					intervalCards.push({
						uid: `interval sheet ${note.name} ${interval} up ${staff}`,
						type: CardTypeEnum.BasicSheet,
						question: {
							notes: [note.name],
							staff,
							interval: {
								direction: 'up',
								interval,
							},
						},
						answer: { notes: [transposedUp.name], type: AnswerType.Exact },
					});
				}

				if (
					transposedDown &&
					!transposedDown.name.includes('##') &&
					!transposedDown.name.includes('bb') &&
					withinRange(transposedDown)
				) {
					intervalCards.push({
						uid: `interval sheet ${note.name} ${interval} down ${staff}`,
						type: CardTypeEnum.BasicSheet,
						question: {
							notes: [note.name],
							staff,
							interval: {
								direction: 'down',
								interval,
							},
						},
						answer: { notes: [transposedDown.name], type: AnswerType.Exact },
					});
				}
			});

			switch (staff) {
				case StaffEnum.Treble:
					trebleSheetCards[interval] = intervalCards;
					break;
				case StaffEnum.Bass:
					bassSheetCards[interval] = intervalCards;
					break;
				default:
					break;
			}
		});
	};

	intervalsInPreferredOrder.forEach((interval) => {
		uniqueNotes.forEach((noteName) => {
			addSheetCards(noteName, interval);
		});

		notes.forEach((noteName) => {
			const note = Note.get(noteName);

			const transposedUp = Note.transpose(note.name, interval);
			const transposedDown = Note.transpose(note.name, Interval.invert(interval));

			if (!transposedUp.includes('##') && !transposedUp.includes('bb')) {
				noteNameCards.push({
					uid: `interval name ${noteName} ${interval} up`,
					type: CardTypeEnum.Interval,
					question: {
						interval,
						direction: 'up',
						note: note.name,
					},
					answer: { notes: [transposedUp], type: AnswerType.AnyOctave },
				});
			}

			if (!transposedDown.includes('##') && !transposedDown.includes('bb')) {
				noteNameCards.push({
					uid: `interval name ${noteName} ${interval} down`,
					type: CardTypeEnum.Interval,
					question: {
						interval,
						direction: 'down',
						note: note.name,
					},
					answer: { notes: [transposedDown], type: AnswerType.AnyOctave },
				});
			}
		});
	});

	return {
		noteNameCards,
		trebleSheetCards: zipVariedLengths(...Object.values(trebleSheetCards)).flat(),
		bassSheetCards: zipVariedLengths(...Object.values(bassSheetCards)).flat(),
	};
}

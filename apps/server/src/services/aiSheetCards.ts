import { z } from 'zod';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import { MultiSheetQuestion, StackedNotes } from 'MemoryFlashCore/src/types/MultiSheetCard';
import {
	beatsPerBarOf,
	createRestDurations,
	DEFAULT_BEATS_PER_BAR,
	Duration,
	durationBeats,
} from 'MemoryFlashCore/src/lib/measure';
import { calcBars, stackBeats } from 'MemoryFlashCore/src/lib/calcBars';
import { majorKeys } from 'MemoryFlashCore/src/lib/notes';
import {
	normalizeTies,
	splitStackIntoBars,
	withBeatsPerBar,
} from 'MemoryFlashCore/src/lib/recording/bars';
import { arrayOf, enumOf, object } from './jsonSchema';

const NOTE_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'].flatMap((l) => [l, `${l}#`, `${l}b`]);
const DURATIONS = Object.keys(durationBeats) as [Duration, ...Duration[]];
const STAVES = [StaffEnum.Treble, StaffEnum.Bass] as const;

const zAiStackItem = z.object({
	notes: z.array(z.object({ name: z.string(), octave: z.number() })),
	duration: z.enum(DURATIONS),
	rest: z.boolean(),
	tieToNext: z.boolean(),
	chordName: z.string(),
});

export const zAiPassage = z.object({
	prompt: z.string(),
	keySignature: z.string(),
	beatsPerBar: z.number(),
	voices: z.array(z.object({ staff: z.enum(STAVES), stack: z.array(zAiStackItem) })),
});

export type AiStackItem = z.infer<typeof zAiStackItem>;
export type AiPassage = z.infer<typeof zAiPassage>;

export const PASSAGE_SCHEMA = object({
	prompt: { type: 'string' },
	keySignature: enumOf(majorKeys),
	beatsPerBar: { type: 'integer' },
	voices: arrayOf(
		object({
			staff: enumOf(STAVES),
			stack: arrayOf(
				object({
					notes: arrayOf(
						object({ name: enumOf(NOTE_NAMES), octave: { type: 'integer' } }),
					),
					duration: enumOf(DURATIONS),
					rest: { type: 'boolean' },
					tieToNext: { type: 'boolean' },
					chordName: { type: 'string' },
				}),
			),
		}),
	),
});

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, Math.round(n)));
const allNotes = (item?: AiStackItem) => item?.notes.map((_, i) => i);

function toStackItem(item: AiStackItem, prev?: AiStackItem): StackedNotes {
	const rest = item.rest || item.notes.length === 0;
	if (rest) return { notes: [], duration: item.duration, rest: true };
	const notes = item.notes.map((n) => ({ name: n.name, octave: clamp(n.octave, 0, 8) }));
	const toNext = item.tieToNext ? allNotes(item) : undefined;
	const fromPrevious = prev?.tieToNext ? allNotes(item) : undefined;
	return {
		notes,
		duration: item.duration,
		...(item.chordName.trim() ? { chordName: item.chordName.trim() } : {}),
		...(toNext || fromPrevious ? { tie: { toNext, fromPrevious } } : {}),
	};
}

function padVoices(question: MultiSheetQuestion): MultiSheetQuestion {
	const total = calcBars(question) * beatsPerBarOf(question);
	const voices = question.voices.map((v) => ({
		...v,
		stack: [...v.stack, ...createRestDurations(total - stackBeats(v.stack))],
	}));
	return { ...question, voices };
}

const uniqueStaves = (voices: AiPassage['voices']) =>
	voices.filter((v, i) => voices.findIndex((w) => w.staff === v.staff) === i);

export function passageToQuestion(passage: AiPassage): MultiSheetQuestion {
	const valid = passage.beatsPerBar >= 1 && passage.beatsPerBar <= 12;
	const beatsPerBar = valid ? Math.round(passage.beatsPerBar) : DEFAULT_BEATS_PER_BAR;
	const voices = uniqueStaves(passage.voices).map((v) => ({
		staff: v.staff,
		stack: normalizeTies(v.stack.map((item, i) => toStackItem(item, v.stack[i - 1]))),
	}));
	const key = majorKeys.includes(passage.keySignature) ? passage.keySignature : 'C';
	return padVoices(withBeatsPerBar({ key, voices }, beatsPerBar));
}

/** The first mis-filled bar of each voice, e.g. a note that runs over the barline. */
export function barProblems(question: MultiSheetQuestion): string[] {
	const beatsPerBar = beatsPerBarOf(question);
	return question.voices.flatMap((voice) => {
		const bars = splitStackIntoBars(voice.stack, beatsPerBar).map(stackBeats);
		const bad = bars.findIndex((beats) => Math.abs(beats - beatsPerBar) > 1e-9);
		return bad < 0
			? []
			: [`${voice.staff} bar ${bad + 1} has ${bars[bad]} beats, expected ${beatsPerBar}`];
	});
}

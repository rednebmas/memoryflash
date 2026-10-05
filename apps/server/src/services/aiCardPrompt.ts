import { z } from 'zod';
import {
	GenerateCardsInput,
	GeneratedCardType,
	sheetTypes,
	wantsChords,
} from 'MemoryFlashCore/src/types/GeneratedCards';
import { arrayOf, enumOf, object, strings } from './jsonSchema';
import { PASSAGE_SCHEMA, zAiPassage } from './aiSheetCards';
import type { ExistingChordCard } from './aiCardService';

const zAiChordCard = z.object({
	prompt: z.string(),
	chords: z.array(z.string()),
	key: z.string(),
	patternId: z.string(),
	notation: z.enum(['chordNames', 'romanNumerals']),
});

export const zAiSong = z.object({
	title: z.string(),
	artist: z.string(),
	key: z.string(),
	patterns: z.array(
		z.object({ id: z.string(), chords: z.array(z.string()), sections: z.array(z.string()) }),
	),
	cards: z.array(zAiChordCard).default([]),
	passages: z.array(zAiPassage).default([]),
});

export type AiSong = z.input<typeof zAiSong>;

const CHORD_CARD_SCHEMA = object({
	prompt: { type: 'string' },
	chords: strings,
	key: { type: 'string' },
	patternId: { type: 'string' },
	notation: enumOf(['chordNames', 'romanNumerals']),
});

export const buildSongSchema = (types: GeneratedCardType[]) =>
	object({
		title: { type: 'string' },
		artist: { type: 'string' },
		key: { type: 'string' },
		patterns: arrayOf(object({ id: { type: 'string' }, chords: strings, sections: strings })),
		...(wantsChords(types) ? { cards: arrayOf(CHORD_CARD_SCHEMA) } : {}),
		...(sheetTypes(types).length ? { passages: arrayOf(PASSAGE_SCHEMA) } : {}),
	});

const COMMON_PROMPT = [
	'You turn songs and music into flash cards for a piano memorisation app.',
	'The request is one free-form text: pasted chords + lyrics (Ultimate Guitar style), a description of the cards wanted, instructions such as "transcribe the melody" or "skip the bridge", or any mix of these.',
	'The user may attach an image, such as a photo of sheet music or a lead sheet; read it as the source material and follow the user text for what to do with it.',
	'Find the song sections and the repeating chord patterns: group sections that share the same progression into one pattern with a short id (A, B, C...). Fill title, artist, key and patterns even when no chord cards are requested.',
	'key is the song key as tonic plus mode, e.g. "B minor" or "G major".',
	'Never include lyrics in the output.',
];

const CHORD_PROMPT = [
	'cards are chord-progression cards: one card per distinct pattern. A card prompt is markdown, formatted "[Section names] Song title", e.g. "[Verse / Intro] Hotel California". For described (non-song) requests write a clear prompt instead.',
	'Chords are plain ASCII chord symbols (C, Am7, F#m, Bb, G/B, Dm7b5). List every chord in playing order, one entry per chord change; repeat a chord if it is played again. Each card also carries its key.',
	'notation is "chordNames" unless the user explicitly asks for roman numeral cards.',
	'Do not duplicate existing cards unless the user asks for variants of them.',
];

const SHEET_PROMPT = [
	'passages are music notation cards: exact notes the student plays. Transcribe what the user asks for: the melody (right hand, Treble staff) by default, the left hand on the Bass staff, or both hands as two voices when asked. Make one passage per section, prompt formatted "[Section · Melody] Song title" (or "· Both hands", "· Left hand").',
	'keySignature is the major key with the same key signature (G minor -> Bb). beatsPerBar counts quarter-note beats per bar: 4/4 -> 4, 3/4 -> 3, 2/4 -> 2, 6/8 -> 3, 2/2 -> 4.',
	"Use at most one voice per staff (one Treble, one Bass); fold inner parts into that hand's chords. Each voice is a stack of events in time order. An event is a single note or a chord of simultaneous notes in that hand, with one duration: w=whole, h=half, q=quarter, 8=eighth, 16=sixteenth, append d for dotted (qd = dotted quarter). A rest has rest=true and no notes.",
	'Note names are the written pitch with its accidental from the key signature applied (in F major write Bb, not B); octave uses scientific pitch, middle C = C4.',
	'Every bar of every voice must add up to exactly beatsPerBar beats: a note that sounds across a barline is split into two notes with tieToNext=true on the first; a pickup bar is filled with leading rests. Both voices cover the same number of bars.',
	'chordName is the chord symbol where a chord change starts on that event (from the chart or the harmony), otherwise "".',
	'Copy the notation from the source exactly; never simplify rhythms. If you only have a description, compose correct notation for it.',
];

const BOTH_PROMPT = [
	'Return both cards and passages: the student wants notation and chord-progression cards from this one request. When the source has no chord symbols, derive the progression from the harmony.',
];

export const buildSystemPrompt = (types: GeneratedCardType[]): string => {
	const chords = wantsChords(types);
	const sheets = sheetTypes(types).length > 0;
	return [
		...COMMON_PROMPT,
		...(chords ? CHORD_PROMPT : []),
		...(sheets ? SHEET_PROMPT : []),
		...(chords && sheets ? BOTH_PROMPT : []),
	].join('\n');
};

export const partPrompt = (prompt: string, i: number, total: number): string =>
	total === 1 ? prompt : prompt.replace(/^\[(.+?)\]/, `[$1 · Part ${i + 1}]`);

export const buildUserPrompt = (
	input: GenerateCardsInput,
	existing: ExistingChordCard[],
): string => {
	const existingText = existing.length
		? `Existing cards in this deck:\n${existing.map((c) => `- ${c.prompt.replace(/\n/g, ' ')}: ${c.chords.join(' ')}${c.key ? ` (key ${c.key})` : ''}`).join('\n')}`
		: 'The deck has no chord cards yet.';
	const image = input.image ? 'An attached image is part of the request.' : '';
	return [existingText, image, 'Request:', input.text].filter(Boolean).join('\n\n');
};

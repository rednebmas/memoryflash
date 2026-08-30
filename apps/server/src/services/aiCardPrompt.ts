import { z } from 'zod';
import { GenerateCardsInput } from 'MemoryFlashCore/src/types/GeneratedCards';
import type { ExistingChordCard } from './aiCardService';

export const zAiSong = z.object({
	title: z.string(),
	artist: z.string(),
	key: z.string(),
	patterns: z.array(
		z.object({ id: z.string(), chords: z.array(z.string()), sections: z.array(z.string()) }),
	),
	cards: z.array(
		z.object({
			prompt: z.string(),
			chords: z.array(z.string()),
			key: z.string(),
			patternId: z.string(),
			notation: z.enum(['chordNames', 'romanNumerals']),
		}),
	),
});

const strings = { type: 'array', items: { type: 'string' } };
const object = (properties: Record<string, unknown>) => ({
	type: 'object',
	properties,
	required: Object.keys(properties),
	additionalProperties: false,
});

export const SONG_CARDS_SCHEMA = object({
	title: { type: 'string' },
	artist: { type: 'string' },
	key: { type: 'string' },
	patterns: {
		type: 'array',
		items: object({ id: { type: 'string' }, chords: strings, sections: strings }),
	},
	cards: {
		type: 'array',
		items: object({
			prompt: { type: 'string' },
			chords: strings,
			key: { type: 'string' },
			patternId: { type: 'string' },
			notation: { type: 'string', enum: ['chordNames', 'romanNumerals'] },
		}),
	},
});

export const buildSystemPrompt = (): string =>
	[
		'You turn songs into chord-progression flash cards for a piano memorisation app.',
		'Input is either pasted chords + lyrics (Ultimate Guitar style, chord symbols above lyric lines) or a free-form description of the cards wanted.',
		'Find the repeating chord patterns: group sections that share the same progression into one pattern and give it a short id (A, B, C...).',
		'Propose one card per distinct pattern. A card prompt is markdown, formatted "[Section names] Song title", e.g. "[Verse / Intro] Hotel California". For described (non-song) requests write a clear prompt instead.',
		'Chords are plain ASCII chord symbols (C, Am7, F#m, Bb, G/B, Dm7b5). List every chord in playing order, one entry per chord change; repeat a chord if it is played again. Never include lyrics in the output.',
		'key is the song key as tonic plus mode, e.g. "B minor" or "G major". Each card also carries its key.',
		'notation is "chordNames" unless the user explicitly asks for roman numeral cards.',
		'Do not duplicate existing cards unless the user asks for variants of them.',
	].join('\n');

export const buildUserPrompt = (
	input: GenerateCardsInput,
	existing: ExistingChordCard[],
): string => {
	const existingText = existing.length
		? `Existing cards in this deck:\n${existing.map((c) => `- ${c.prompt.replace(/\n/g, ' ')}: ${c.chords.join(' ')}${c.key ? ` (key ${c.key})` : ''}`).join('\n')}`
		: 'The deck has no chord cards yet.';
	const instructions = input.instructions.trim()
		? `Instructions: ${input.instructions.trim()}`
		: '';
	return [existingText, instructions, 'Input:', input.text].filter(Boolean).join('\n\n');
};

import { z } from 'zod';
import { Card } from '../models/Card';
import { AnswerType, ChordMemoryAnswer } from 'MemoryFlashCore/src/types/Cards';
import {
	GenerateCardsInput,
	GeneratedCard,
	GeneratedSong,
} from 'MemoryFlashCore/src/types/GeneratedCards';
import { invalidChordNames } from 'MemoryFlashCore/src/lib/chordTones';
import { JsonCompletion, openAiJsonCompletion } from './openaiClient';
import { SONG_CARDS_SCHEMA, buildSystemPrompt, buildUserPrompt, zAiSong } from './aiCardPrompt';

export type ExistingChordCard = { prompt: string; chords: string[]; key?: string };

const MAX_CHORDS_PER_CARD = 8;

export async function getExistingChordCards(deckId: string): Promise<ExistingChordCard[]> {
	const cards = await Card.find({ deckId, 'answer.type': AnswerType.ChordMemory });
	return cards.map((card) => {
		const answer = card.answer as ChordMemoryAnswer;
		const prompt = card.question.presentationModes?.find((m) => m.id === 'Text Prompt');
		return {
			prompt: prompt && 'text' in prompt ? prompt.text : '',
			chords: answer.chords.map((c) => c.chordName),
			key: answer.key,
		};
	});
}

export async function generateSongCards(
	input: GenerateCardsInput,
	existing: ExistingChordCard[],
	complete: JsonCompletion = openAiJsonCompletion,
): Promise<GeneratedSong> {
	const raw = await complete(
		buildSystemPrompt(),
		buildUserPrompt(input, existing),
		SONG_CARDS_SCHEMA,
	);
	const ai = zAiSong.parse(JSON.parse(raw));
	return finalizeSong(ai, input);
}

export function normalizeKey(key: string): string {
	const match = key.trim().match(/^([A-Ga-g])\s*([#b♯♭]?)\s*(.*)$/);
	if (!match) return 'C';
	const [, letter, acc, rest] = match;
	const tonic = letter.toUpperCase() + acc.replace('♯', '#').replace('♭', 'b');
	return /^(min|m(?!aj)|-)/i.test(rest) ? `${tonic}m` : tonic;
}

export function splitChords(chords: string[], max = MAX_CHORDS_PER_CARD): string[][] {
	const parts = Math.ceil(chords.length / max);
	const size = Math.ceil(chords.length / parts);
	return Array.from({ length: parts }, (_, i) => chords.slice(i * size, (i + 1) * size));
}

export function romanVariantPrompt(prompt: string): string {
	return /^\[.+?\]/.test(prompt)
		? prompt.replace(/^\[(.+?)\]/, '[$1 · roman numerals]')
		: `${prompt} · roman numerals`;
}

const partPrompt = (prompt: string, i: number, total: number): string =>
	total === 1 ? prompt : prompt.replace(/^\[(.+?)\]/, `[$1 · Part ${i + 1}]`);

export function finalizeSong(
	ai: z.infer<typeof zAiSong>,
	input: GenerateCardsInput,
): GeneratedSong {
	const key = normalizeKey(ai.key);
	const cards: GeneratedCard[] = ai.cards.flatMap((card) => {
		const parts = input.splitLongSections ? splitChords(card.chords) : [card.chords];
		return parts.map((chords, i) => ({
			prompt: partPrompt(card.prompt, i, parts.length),
			chords,
			key: card.key ? normalizeKey(card.key) : key,
			notation: card.notation,
			patternId: card.patternId,
			invalidChords: invalidChordNames(chords),
		}));
	});
	const variants = input.romanVariants
		? cards
				.filter((c) => c.notation === 'chordNames')
				.map((c) => ({
					...c,
					notation: 'romanNumerals' as const,
					prompt: romanVariantPrompt(c.prompt),
				}))
		: [];
	return {
		title: ai.title,
		artist: ai.artist,
		key,
		patterns: ai.patterns,
		cards: [...cards, ...variants],
	};
}

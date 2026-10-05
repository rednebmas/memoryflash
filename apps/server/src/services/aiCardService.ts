import { Card } from '../models/Card';
import { AnswerType, ChordMemoryAnswer } from 'MemoryFlashCore/src/types/Cards';
import {
	GENERATED_CARD_TYPES,
	GenerateCardsInput,
	GeneratedCardType,
	GeneratedChordCard,
	GeneratedSheetCard,
	GeneratedSong,
	sheetTypes,
	wantsChords,
} from 'MemoryFlashCore/src/types/GeneratedCards';
import { presentationModeFor } from 'MemoryFlashCore/src/lib/presentationMode';
import { segmentQuestion } from 'MemoryFlashCore/src/lib/recording/bars';
import { invalidChordNames } from 'MemoryFlashCore/src/lib/chordTones';
import { Err } from '../middleware/errorHandler';
import { JsonCompletion, openAiJsonCompletion } from './openaiClient';
import {
	AiSong,
	buildSongSchema,
	buildSystemPrompt,
	buildUserPrompt,
	partPrompt,
	zAiSong,
} from './aiCardPrompt';
import { AiPassage, barProblems, passageToQuestion } from './aiSheetCards';

export type ExistingChordCard = { prompt: string; chords: string[]; key?: string };

const MAX_CHORDS_PER_CARD = 8;
const MAX_BARS_PER_CARD = 4;
const IMAGE_DATA_URL = /^data:image\/(png|jpeg|webp|gif);base64,/;

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

export function validateGenerateInput(input: GenerateCardsInput) {
	if (!input.text?.trim()) throw new Err('Describe the cards you want', 400);
	if (input.image && !IMAGE_DATA_URL.test(input.image)) throw new Err('Invalid image', 400);
}

export async function generateSongCards(
	input: GenerateCardsInput,
	existing: ExistingChordCard[],
	complete: JsonCompletion = openAiJsonCompletion,
	onBuilding: () => void = () => {},
): Promise<GeneratedSong> {
	validateGenerateInput(input);
	const types = cardTypesOf(input);
	const raw = await complete(
		buildSystemPrompt(types),
		buildUserPrompt(input, existing),
		buildSongSchema(types),
		input.image,
	);
	onBuilding();
	return finalizeSong(JSON.parse(raw), { ...input, cardTypes: types });
}

function cardTypesOf(input: GenerateCardsInput): GeneratedCardType[] {
	const types = GENERATED_CARD_TYPES.filter((t) => input.cardTypes?.includes(t));
	return types.length ? types : ['Chord Memory'];
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

function chordCards(ai: AiSong, input: GenerateCardsInput, key: string): GeneratedChordCard[] {
	const cards = (ai.cards ?? []).flatMap((card) => {
		const parts = input.splitLongSections ? splitChords(card.chords) : [card.chords];
		return parts.map((chords, i) => ({
			type: 'Chord Memory' as const,
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
	return [...cards, ...variants];
}

function passageParts(passage: AiPassage, split: boolean) {
	const question = passageToQuestion(passage);
	const parts = split ? segmentQuestion(question, MAX_BARS_PER_CARD) : [question];
	return parts.map((q, i) => ({
		question: q,
		prompt: partPrompt(passage.prompt, i, parts.length),
		problems: barProblems(q),
	}));
}

function sheetCards(ai: AiSong, input: GenerateCardsInput): GeneratedSheetCard[] {
	const parts = (ai.passages ?? []).flatMap((p) => passageParts(p, input.splitLongSections));
	return sheetTypes(input.cardTypes).flatMap((type) =>
		parts.map(({ question, prompt, problems }) => ({
			type,
			prompt,
			question: { ...question, presentationModes: [presentationModeFor(type, prompt)] },
			problems,
		})),
	);
}

export function finalizeSong(raw: AiSong, input: GenerateCardsInput): GeneratedSong {
	const ai = zAiSong.parse(raw);
	const key = normalizeKey(ai.key);
	const chords = wantsChords(input.cardTypes) ? chordCards(ai, input, key) : [];
	return {
		title: ai.title,
		artist: ai.artist,
		key,
		patterns: ai.patterns,
		cards: [...sheetCards(ai, input), ...chords],
	};
}

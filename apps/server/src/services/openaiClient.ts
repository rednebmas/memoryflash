import OpenAI from 'openai';
import { Err } from '../middleware/errorHandler';
import { JsonSchema } from './jsonSchema';

export const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-6.1-sol';

export type JsonCompletion = (
	system: string,
	user: string,
	schema: JsonSchema,
	image?: string,
) => Promise<string>;

export const buildUserContent = (text: string, image?: string) =>
	image
		? [
				{ type: 'input_text' as const, text },
				{ type: 'input_image' as const, image_url: image, detail: 'high' as const },
			]
		: text;

export const openAiJsonCompletion: JsonCompletion = async (system, user, schema, image) => {
	if (!process.env.OPENAI_API_KEY) throw new Err('OPENAI_API_KEY is not configured', 500);
	const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
	const response = await client.responses.create({
		model: OPENAI_MODEL,
		reasoning: { effort: 'low' },
		input: [
			{ role: 'system', content: system },
			{ role: 'user', content: buildUserContent(user, image) },
		],
		text: { format: { type: 'json_schema', name: 'song_cards', schema, strict: true } },
	});
	return response.output_text;
};

import OpenAI from 'openai';
import { Err } from '../middleware/errorHandler';

export const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-5.6-sol';

export type JsonCompletion = (
	system: string,
	user: string,
	schema: Record<string, unknown>,
) => Promise<string>;

export const openAiJsonCompletion: JsonCompletion = async (system, user, schema) => {
	if (!process.env.OPENAI_API_KEY) throw new Err('OPENAI_API_KEY is not configured', 500);
	const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
	const response = await client.responses.create({
		model: OPENAI_MODEL,
		input: [
			{ role: 'system', content: system },
			{ role: 'user', content: user },
		],
		text: { format: { type: 'json_schema', name: 'song_cards', schema, strict: true } },
	});
	return response.output_text;
};

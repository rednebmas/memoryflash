import { randomUUID } from 'crypto';
import { GenerateCardsInput, GenerationJobStatus } from 'MemoryFlashCore/src/types/GeneratedCards';
import { Err } from '../middleware/errorHandler';
import { JsonCompletion, openAiJsonCompletion } from './openaiClient';
import { ExistingChordCard, generateSongCards, validateGenerateInput } from './aiCardService';

type Job = GenerationJobStatus & { userId: string; startedAt: number; error?: Err };

const JOB_TTL_MS = 15 * 60 * 1000;
const jobs = new Map<string, Job>();

const sweep = () => {
	const cutoff = Date.now() - JOB_TTL_MS;
	jobs.forEach((job, id) => job.startedAt < cutoff && jobs.delete(id));
};

const failure = (error: Error | Err) => {
	console.error(error);
	return error instanceof Err ? error : new Err('Generation failed. Please try again.', 500);
};

export function startGenerationJob(
	userId: string,
	input: GenerateCardsInput,
	existing: ExistingChordCard[],
	complete: JsonCompletion = openAiJsonCompletion,
): string {
	validateGenerateInput(input);
	sweep();
	const id = randomUUID();
	const job: Job = { userId, startedAt: Date.now(), stage: 'generating' };
	jobs.set(id, job);
	generateSongCards(input, existing, complete, () => (job.stage = 'building'))
		.then((song) => (job.song = song))
		.catch((error) => (job.error = failure(error)));
	return id;
}

export function getGenerationJob(id: string, userId: string): GenerationJobStatus {
	const job = jobs.get(id);
	if (job?.userId !== userId) throw new Err('Generation was interrupted. Please try again.', 404);
	if (job.error || job.song) jobs.delete(id);
	if (job.error) throw job.error;
	return { stage: job.stage, song: job.song };
}

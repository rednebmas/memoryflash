import { Page } from '@playwright/test';
import { buildScoreTimeline } from 'MemoryFlashCore/src/lib/scoreTimeline.ts';
import { runRecorderEvents } from './runRecorderEvents';

const remainingBeats = async (page: Page) => {
	const { question, index } = await page.evaluate(() => {
		const state = (window as any).store.getState();
		const card = state.cards.entities[state.scheduler.currCard];
		return { question: card.question, index: state.scheduler.multiPartCardIndex };
	});
	const { events, beats } = buildScoreTimeline(question);
	return beats
		.slice(index, -1)
		.map((beat) => events.filter((e) => e.start === beat).map((e) => e.midi));
};

export const playCurrentCard = async (page: Page) =>
	runRecorderEvents(page, undefined, await remainingBeats(page));

export const playWrongNote = (page: Page) => runRecorderEvents(page, undefined, [[30]]);

export const playNextBeat = async (page: Page) =>
	runRecorderEvents(page, undefined, (await remainingBeats(page)).slice(0, 1));

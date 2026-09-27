import { createSelector } from '@reduxjs/toolkit';
import { chromaMatch, noteWindows } from '../../lib/rhythm/coverage';
import { ReduxState } from '../store';
import {
	currentSheetCardSelector,
	instrumentSelector,
	saxAnyOctaveSelector,
} from './instrumentSelector';
import {
	currRhythmCardSelector,
	rhythmActiveSelector,
	rhythmLatencyMsSelector,
} from './rhythmSelectors';

export const saxRhythmActiveSelector = createSelector(
	[rhythmActiveSelector, instrumentSelector],
	(active, instrument) => active && instrument === 'sax',
);

export const saxPitchMatchSelector = createSelector([saxAnyOctaveSelector], (anyOctave) =>
	anyOctave ? chromaMatch : undefined,
);

export const saxNoteWindowsSelector = createSelector(
	[
		saxRhythmActiveSelector,
		currentSheetCardSelector,
		currRhythmCardSelector,
		(s: ReduxState) => s.rhythm.grid,
		rhythmLatencyMsSelector,
	],
	(active, card, rhythmCard, grid, latencyMs) => {
		if (!active || !card || !grid || rhythmCard?.anchorMs === undefined) return [];
		const anchorMs = rhythmCard.anchorMs + latencyMs;
		const beat0 = rhythmCard.anchorBeat ?? 0;
		return noteWindows(card.question, { anchorMs, beat0, beatMs: grid.beatMs });
	},
);

export const saxFirstNoteSelector = createSelector([currentSheetCardSelector], (card) => {
	if (!card) return undefined;
	const [first] = noteWindows(card.question, { anchorMs: 0, beat0: 0, beatMs: 1 });
	return first && { midis: first.midis, beat: first.startMs };
});

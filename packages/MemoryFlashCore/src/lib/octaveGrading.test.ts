import { expect } from 'chai';
import { AnswerType, CardTypeEnum } from '../types/Cards';
import { PresentationMode, PresentationModeIds } from '../types/PresentationMode';
import { makeCard } from './schedulers/testHelpers';
import { soEasyC, soEasyNamesC } from './testData/soEasyToFallInLove';
import { withChordNames } from './chordNames';
import { activeNotesAt, buildScoreTimeline } from './scoreTimeline';
import { multiSheetEngine } from './ValidatorEngine';
import { gradesAnyOctave } from './presentationMode';
import { setupRhythmStore } from '../redux/testStore';
import { Instrument, settingsActions } from '../redux/slices/settingsSlice';
import { rhythmActions } from '../redux/slices/rhythmSlice';
import { selectGradesAnyOctave } from '../redux/selectors/activePresentationModeSelector';
import { rhythmActiveSelector } from '../redux/selectors/rhythmSelectors';
import { saxPitchMatchSelector } from '../redux/selectors/saxRhythmSelectors';
import { chromaMatch } from './rhythm/coverage';
import { AppDispatch } from '../redux/store';

const presentationModes: PresentationMode[] = [
	{ id: 'Sheet Music' },
	{ id: 'Key Signature Only', textAbove: 'So Easy' },
	{ id: 'First Chord Only', textAbove: 'So Easy' },
	{ id: 'Text Prompt', text: 'So Easy in C' },
];
const question = { ...withChordNames(soEasyC, soEasyNamesC), presentationModes };
const soEasyCard = {
	...makeCard('so-easy'),
	type: CardTypeEnum.MultiSheet,
	question,
	answer: { type: AnswerType.ExactMulti },
};

const setup = (mode: PresentationModeIds, metronome: boolean, instrument: Instrument = 'piano') => {
	const store = setupRhythmStore([soEasyCard], instrument);
	if (!metronome) store.dispatch(rhythmActions.setGrid(undefined));
	store.dispatch(
		settingsActions.setPresentationMode({ cardType: CardTypeEnum.MultiSheet, mode }),
	);
	return store;
};

const playCardOctaveUp = async (store: ReturnType<typeof setup>) => {
	const timeline = buildScoreTimeline(question);
	const engine = multiSheetEngine(question, selectGradesAnyOctave(store.getState()));
	const dispatch = store.dispatch as AppDispatch;
	for (let step = 0; step < timeline.beats.length - 1 && !store.posted.length; step++) {
		const index = store.getState().scheduler.multiPartCardIndex;
		const time = 1000 + timeline.beats[index] * 500;
		const notes = activeNotesAt(timeline, index).map((n) => ({ number: n.midi + 12, time }));
		engine.handle({ notes, waitingNotes: [], waiting: false, index, dispatch });
		engine.handle({ notes: [], waitingNotes: [], waiting: false, index, dispatch });
	}
	await Promise.resolve();
	const posted = store.posted[0] as { correct: boolean } | undefined;
	return !store.getState().scheduler.incorrect && posted?.correct === true;
};

const noStaff: PresentationModeIds[] = [
	'Chords',
	'Roman Numerals',
	'Text Prompt',
	'Key Signature Only',
	'First Chord Only',
];
const staff: PresentationModeIds[] = ['Sheet Music', 'Sheet Music w/ Chords'];

describe('gradesAnyOctave', () => {
	it('grades by note names whenever the staff is not shown', () => {
		noStaff.forEach((id) => expect(gradesAnyOctave(id), id).to.equal(true));
		staff.forEach((id) => expect(gradesAnyOctave(id), id).to.equal(false));
	});
});

describe('wrong-octave plays of a So Easy card', () => {
	[false, true].forEach((metronome) => {
		const label = metronome ? 'with the metronome on' : 'with the metronome off';

		noStaff.forEach((mode) =>
			it(`count as correct in ${mode} ${label}`, async () => {
				const store = setup(mode, metronome);
				expect(rhythmActiveSelector(store.getState())).to.equal(metronome);
				expect(await playCardOctaveUp(store)).to.equal(true);
			}),
		);

		staff.forEach((mode) =>
			it(`count as wrong in ${mode} ${label}`, async () => {
				const store = setup(mode, metronome);
				expect(await playCardOctaveUp(store)).to.equal(false);
			}),
		);
	});
});

describe('sax with the metronome on', () => {
	it('matches notes in any octave unless the staff is shown', () => {
		const expected = [
			...noStaff.map((mode) => [mode, chromaMatch] as const),
			...staff.map((mode) => [mode, undefined] as const),
		];
		expected.forEach(([mode, match]) =>
			expect(saxPitchMatchSelector(setup(mode, true, 'sax').getState()), mode).to.equal(
				match,
			),
		);
	});
});

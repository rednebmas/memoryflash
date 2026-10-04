import { expect } from 'chai';
import { rhythmActions } from '../slices/rhythmSlice';
import { settingsActions } from '../slices/settingsSlice';
import { userDeckStatsActions } from '../slices/userDeckStatsSlice';
import { rhythmCard, setupRhythmStore } from '../testStore';
import { deckTempoSelector, rhythmStatusSelector, timingStripSelector } from './rhythmSelectors';

const setup = () => setupRhythmStore([rhythmCard('a')]);
type Store = ReturnType<typeof setup>;

const grade = (store: Store, index: number, offsetMs: number | null) => {
	const batchId = store.getState().scheduler.batchId;
	const tier = offsetMs === null ? ('miss' as const) : ('good' as const);
	store.dispatch(
		rhythmActions.gradeStep({ batchId, index, grade: { onsetMs: 0, offsetMs, tier } }),
	);
};

describe('rhythmStatusSelector', () => {
	it('shows nothing while the metronome is off', () => {
		const store = setup();
		store.dispatch(rhythmActions.setGrid(undefined));
		expect(rhythmStatusSelector(store.getState())).to.equal(undefined);
	});

	it('grades timing at the default tempo for a deck with no rhythm settings', () => {
		const store = setup();
		store.dispatch(
			userDeckStatsActions.upsert([{ _id: 's', deckId: 'd1', rhythm: undefined } as never]),
		);
		expect(rhythmStatusSelector(store.getState())).to.equal(
			'Rhythm mode · 80 bpm · your first chord sets beat one',
		);
	});

	it('says timing is not graded when the input cannot be timed', () => {
		const store = setup();
		store.dispatch(settingsActions.setChordInputMode('names'));
		expect(rhythmStatusSelector(store.getState())).to.equal(
			'Metronome only · 120 bpm · timing is graded with piano or sax input',
		);
	});

	it('plays the deck tempo for chord-name input', () => {
		const store = setup();
		store.dispatch(settingsActions.setChordInputMode('names'));
		expect(deckTempoSelector(store.getState())).to.equal(120);
	});

	it('explains the first chord sets beat one before anything is graded', () => {
		const store = setup();
		expect(rhythmStatusSelector(store.getState())).to.equal(
			'Rhythm mode · 120 bpm · your first chord sets beat one',
		);
	});

	it('reports the verdict for the last graded chord', () => {
		const store = setup();
		grade(store, 0, 0);
		expect(rhythmStatusSelector(store.getState())).to.equal(
			'Rhythm mode · 120 bpm · Good · on the beat',
		);
		grade(store, 1, 45);
		expect(rhythmStatusSelector(store.getState())).to.equal(
			'Rhythm mode · 120 bpm · Good · 45 ms late',
		);
		grade(store, 2, -30);
		expect(rhythmStatusSelector(store.getState())).to.match(/30 ms early$/);
		grade(store, 2, null);
		expect(rhythmStatusSelector(store.getState())).to.match(/Missed$/);
	});
});

describe('timingStripSelector', () => {
	it('shows an empty strip once grading is live, before any chord is played', () => {
		const store = setup();
		expect(timingStripSelector(store.getState())?.ticks).to.deep.equal([]);
	});

	it('hides the strip when the metronome is off and nothing was graded', () => {
		const store = setup();
		store.dispatch(rhythmActions.setGrid(undefined));
		expect(timingStripSelector(store.getState())).to.equal(undefined);
	});
});

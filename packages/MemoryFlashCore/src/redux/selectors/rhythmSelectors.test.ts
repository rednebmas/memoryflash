import { expect } from 'chai';
import { rhythmActions } from '../slices/rhythmSlice';
import { rhythmCard, setupRhythmStore } from '../testStore';
import { rhythmStatusSelector, timingStripSelector } from './rhythmSelectors';

const setup = (enabled = true) => setupRhythmStore([rhythmCard('a')], 'piano', { enabled });
type Store = ReturnType<typeof setup>;

const grade = (store: Store, index: number, offsetMs: number | null) => {
	const batchId = store.getState().scheduler.batchId;
	const tier = offsetMs === null ? ('miss' as const) : ('good' as const);
	store.dispatch(
		rhythmActions.gradeStep({ batchId, index, grade: { onsetMs: 0, offsetMs, tier } }),
	);
};

describe('rhythmStatusSelector', () => {
	it('says timing is not graded when the metronome plays with rhythm mode off', () => {
		const store = setup(false);
		expect(rhythmStatusSelector(store.getState())).to.equal(
			"Metronome only · timing isn't graded. Turn on Rhythm in Deck settings",
		);
	});

	it('shows nothing with rhythm mode and the metronome both off', () => {
		const store = setup(false);
		store.dispatch(rhythmActions.setGrid(undefined));
		expect(rhythmStatusSelector(store.getState())).to.equal(undefined);
	});

	it('asks to start the metronome when rhythm mode is on', () => {
		const store = setup();
		store.dispatch(rhythmActions.setGrid(undefined));
		expect(rhythmStatusSelector(store.getState())).to.equal(
			'Rhythm mode · 120 bpm · start the metronome to be graded',
		);
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

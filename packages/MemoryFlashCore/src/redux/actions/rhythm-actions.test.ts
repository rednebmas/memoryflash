import { expect } from 'chai';
import { ChordMemoryValidatorEngine } from '../../lib/ChordMemoryValidatorEngine';
import { MidiNote } from '../slices/midiSlice';
import { rhythmActions } from '../slices/rhythmSlice';
import { settingsActions } from '../slices/settingsSlice';
import { AppDispatch } from '../store';
import { C_MAJOR, rhythmCard, setupRhythmStore } from '../testStore';
import { deckTempoSelector, nextDeadlineMsSelector } from '../selectors/rhythmSelectors';
import { markStepMissed } from './rhythm-actions';

const setup = () => setupRhythmStore([rhythmCard('a'), rhythmCard('b')]);

type Store = ReturnType<typeof setup>;

const playChord = (store: Store, engine: ChordMemoryValidatorEngine, times: number[]) => {
	const notes: MidiNote[] = [60, 64, 67].map((number, i) => ({ number, time: times[i] }));
	const index = store.getState().scheduler.multiPartCardIndex;
	const dispatch = store.dispatch as AppDispatch;
	engine.handle({ notes, waitingNotes: [], waiting: false, index, dispatch });
	engine.handle({ notes: [], waitingNotes: [], waiting: false, index, dispatch });
};

const lastAttempt = (store: Store) =>
	store.posted[store.posted.length - 1] as {
		correct: boolean;
		timing?: { bpm: number; offsetsMs: (number | null)[] };
	};

describe('rhythm grading', () => {
	it('passes a card played on the clicks, snapping the first chord to the nearest click', async () => {
		const store = setup();
		const engine = new ChordMemoryValidatorEngine([C_MAJOR, C_MAJOR, C_MAJOR]);
		playChord(store, engine, [1020, 1020, 1020]);
		playChord(store, engine, [1500, 1500, 1500]);
		playChord(store, engine, [2030, 2030, 2030]);
		await Promise.resolve();
		expect(lastAttempt(store).correct).to.equal(true);
		expect(lastAttempt(store).timing?.offsetsMs).to.deep.equal([20, 0, 30]);
		expect(store.getState().rhythm.lastReport?.steps.map((s) => s.tier)).to.deep.equal([
			'perfect',
			'perfect',
			'perfect',
		]);
	});

	it('lets a first chord far from any click set beat one instead of failing it', async () => {
		const store = setup();
		const engine = new ChordMemoryValidatorEngine([C_MAJOR, C_MAJOR, C_MAJOR]);
		playChord(store, engine, [1200, 1200, 1200]);
		expect(store.getState().scheduler.incorrect).to.not.equal(true);
		playChord(store, engine, [1700, 1700, 1700]);
		playChord(store, engine, [2220, 2220, 2220]);
		await Promise.resolve();
		expect(lastAttempt(store).correct).to.equal(true);
		expect(lastAttempt(store).timing?.offsetsMs).to.deep.equal([0, 0, 20]);
	});

	it('grades a rolled chord by its first note', async () => {
		const store = setup();
		const engine = new ChordMemoryValidatorEngine([C_MAJOR, C_MAJOR, C_MAJOR]);
		playChord(store, engine, [1000, 1000, 1000]);
		playChord(store, engine, [1490, 1560, 1620]);
		playChord(store, engine, [2000, 2000, 2000]);
		await Promise.resolve();
		expect(lastAttempt(store).correct).to.equal(true);
		expect(lastAttempt(store).timing?.offsetsMs[1]).to.equal(-10);
	});

	it('fails a late chord but lets the player finish the card', async () => {
		const store = setup();
		const card = store.getState().scheduler.currCard;
		const engine = new ChordMemoryValidatorEngine([C_MAJOR, C_MAJOR, C_MAJOR]);
		playChord(store, engine, [1000, 1000, 1000]);
		playChord(store, engine, [1650, 1650, 1650]);
		expect(store.getState().scheduler.incorrect).to.equal(true);
		expect(store.getState().scheduler.currCard).to.equal(card);
		playChord(store, engine, [2000, 2000, 2000]);
		await Promise.resolve();
		expect(lastAttempt(store).correct).to.equal(false);
		expect(lastAttempt(store).timing?.offsetsMs).to.deep.equal([0, 150, 0]);
	});

	it('marks a skipped chord missed only once', () => {
		const store = setup();
		const engine = new ChordMemoryValidatorEngine([C_MAJOR, C_MAJOR, C_MAJOR]);
		playChord(store, engine, [1000, 1000, 1000]);
		store.dispatch(markStepMissed(1));
		const queued = store.getState().scheduler.nextCards.length;
		store.dispatch(markStepMissed(1));
		playChord(store, engine, [1800, 1800, 1800]);
		expect(store.getState().scheduler.incorrect).to.equal(true);
		expect(store.getState().rhythm.card?.missReported).to.equal(true);
		expect(store.getState().scheduler.nextCards.length).to.equal(queued);
	});

	it('does nothing when the metronome is not running', async () => {
		const store = setup();
		store.dispatch(rhythmActions.setGrid(undefined));
		const engine = new ChordMemoryValidatorEngine([C_MAJOR, C_MAJOR, C_MAJOR]);
		playChord(store, engine, [1000, 1000, 1000]);
		playChord(store, engine, [5000, 5000, 5000]);
		playChord(store, engine, [9000, 9000, 9000]);
		await Promise.resolve();
		expect(lastAttempt(store).correct).to.equal(true);
		expect(lastAttempt(store).timing).to.equal(undefined);
	});

	it('grades the rest of a card when the metronome starts mid-card', async () => {
		const store = setup();
		store.dispatch(rhythmActions.setGrid(undefined));
		const engine = new ChordMemoryValidatorEngine([C_MAJOR, C_MAJOR, C_MAJOR]);
		playChord(store, engine, [700, 700, 700]);
		store.dispatch(rhythmActions.setGrid({ originMs: 0, beatMs: 500 }));
		playChord(store, engine, [1510, 1510, 1510]);
		expect(nextDeadlineMsSelector(store.getState())).to.equal(2000 + 120);
		playChord(store, engine, [2000, 2000, 2000]);
		await Promise.resolve();
		expect(lastAttempt(store).correct).to.equal(true);
		expect(lastAttempt(store).timing?.offsetsMs).to.deep.equal([null, 10, 0]);
	});

	it('shifts onsets by the calibrated latency', async () => {
		const store = setup();
		store.dispatch(settingsActions.setRhythmLatencyMs(40));
		const engine = new ChordMemoryValidatorEngine([C_MAJOR, C_MAJOR, C_MAJOR]);
		playChord(store, engine, [1040, 1040, 1040]);
		playChord(store, engine, [1540, 1540, 1540]);
		playChord(store, engine, [2090, 2090, 2090]);
		await Promise.resolve();
		expect(lastAttempt(store).timing?.offsetsMs).to.deep.equal([0, 0, 50]);
	});

	it('sets a deadline for the next chord and resets on the next card', async () => {
		const store = setup();
		const engine = new ChordMemoryValidatorEngine([C_MAJOR, C_MAJOR, C_MAJOR]);
		expect(nextDeadlineMsSelector(store.getState())).to.equal(undefined);
		playChord(store, engine, [1000, 1000, 1000]);
		expect(nextDeadlineMsSelector(store.getState())).to.equal(1500 + 120);
		playChord(store, engine, [1500, 1500, 1500]);
		playChord(store, engine, [2000, 2000, 2000]);
		await Promise.resolve();
		expect(nextDeadlineMsSelector(store.getState())).to.equal(undefined);
	});

	it('raises the deck tempo after 7 of 8 cards are played in time', async () => {
		const store = setup();
		for (let card = 0; card < 8; card++) {
			const engine = new ChordMemoryValidatorEngine([C_MAJOR, C_MAJOR, C_MAJOR]);
			const t = 10000 * (card + 1);
			[0, 500, 1000].forEach((beat) =>
				playChord(store, engine, [t + beat, t + beat, t + beat]),
			);
			await Promise.resolve();
		}
		expect(deckTempoSelector(store.getState())).to.equal(125);
		const engine = new ChordMemoryValidatorEngine([C_MAJOR, C_MAJOR, C_MAJOR]);
		[0, 500, 1000].forEach((beat) =>
			playChord(store, engine, [99000 + beat, 99000 + beat, 99000 + beat]),
		);
		await Promise.resolve();
		expect(lastAttempt(store).timing?.bpm).to.equal(125);
	});
});

import { expect } from 'chai';
import { makeCard } from '../../lib/schedulers/testHelpers';
import { ChordMemoryValidatorEngine } from '../../lib/ChordMemoryValidatorEngine';
import { AnswerType, CardTypeEnum, StaffEnum } from '../../types/Cards';
import { UserDeckStatsType } from '../../types/UserDeckStats';
import { authActions } from '../slices/authSlice';
import { cardsActions } from '../slices/cardsSlice';
import { MidiNote } from '../slices/midiSlice';
import { rhythmActions } from '../slices/rhythmSlice';
import { schedulerActions } from '../slices/schedulerSlice';
import { settingsActions } from '../slices/settingsSlice';
import { userDeckStatsActions } from '../slices/userDeckStatsSlice';
import { AppDispatch } from '../store';
import { makeTestStore } from '../testStore';
import { nextDeadlineMsSelector } from '../selectors/rhythmSelectors';
import { markStepMissed } from './rhythm-actions';
import { schedule } from './schedule-cards-action';

const C_MAJOR = { chordName: 'C', requiredTones: ['C', 'E', 'G'], optionalTones: [] };
const chordStack = { notes: ['C', 'E', 'G'].map((name) => ({ name, octave: 4 })), duration: 'q' };

const rhythmCard = (id: string) => ({
	...makeCard(id),
	type: CardTypeEnum.MultiSheet,
	question: { key: 'C', voices: [{ staff: StaffEnum.Treble, stack: Array(3).fill(chordStack) }] },
	answer: { type: AnswerType.ChordMemory, chords: [C_MAJOR, C_MAJOR, C_MAJOR] },
});

const setup = () => {
	const store = makeTestStore();
	store.dispatch(authActions.setUser({ _id: 'u' } as never));
	store.dispatch(cardsActions.upsert([rhythmCard('a'), rhythmCard('b')] as never));
	const rhythm = { enabled: true, bpm: 120, strictness: 'normal' as const };
	store.dispatch(
		userDeckStatsActions.upsert([{ _id: 's', deckId: 'd1', rhythm } as UserDeckStatsType]),
	);
	store.dispatch(settingsActions.setChordInputMode('piano'));
	store.dispatch(schedulerActions.setParsingDeck('d1'));
	store.dispatch(schedule('d1'));
	store.dispatch(rhythmActions.setGrid({ originMs: 0, beatMs: 500 }));
	return store;
};

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
		timing?: { offsetsMs: (number | null)[] };
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
});

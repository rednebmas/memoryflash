import { expect } from 'chai';
import { makeCard } from '../../lib/schedulers/testHelpers';
import { multiSheetEngine } from '../../lib/ValidatorEngine';
import { AnswerType, CardTypeEnum, StaffEnum } from '../../types/Cards';
import { selectGradesAnyOctave } from '../selectors/activePresentationModeSelector';
import { studyInputSelector } from '../selectors/instrumentSelector';
import { noteNamePadKeysSelector } from '../selectors/noteNamePadSelector';
import { rhythmActions } from '../slices/rhythmSlice';
import { Instrument, settingsActions } from '../slices/settingsSlice';
import { AppDispatch } from '../store';
import { setupRhythmStore } from '../testStore';
import { tapNoteName } from './tap-note-name-action';

const question = {
	key: 'C',
	voices: [
		{
			staff: StaffEnum.Treble,
			stack: [{ notes: ['B3', 'D4', 'E4'].map(sheetNote), duration: 'w' as const }],
		},
		{ staff: StaffEnum.Bass, stack: [{ notes: [sheetNote('C3')], duration: 'w' as const }] },
	],
	presentationModes: [{ id: 'Sheet Music' as const }, { id: 'Chords' as const }],
};

function sheetNote(n: string) {
	return { name: n.slice(0, -1), octave: Number(n.slice(-1)) };
}

const cmaj9 = {
	...makeCard('cmaj9'),
	type: CardTypeEnum.MultiSheet,
	question,
	answer: { type: AnswerType.ExactMulti },
};

const setup = (instrument: Instrument = 'names') => {
	const store = setupRhythmStore([cmaj9], instrument);
	store.dispatch(rhythmActions.setGrid(undefined));
	store.dispatch(
		settingsActions.setPresentationMode({
			cardType: CardTypeEnum.MultiSheet,
			mode: 'Sheet Music',
		}),
	);
	return store;
};

const tapAll = async (store: ReturnType<typeof setup>, pitchClasses: number[]) => {
	const engine = multiSheetEngine(question, selectGradesAnyOctave(store.getState()));
	const dispatch = store.dispatch as AppDispatch;
	pitchClasses.forEach((pc) => {
		store.dispatch(tapNoteName(pc));
		const { notes, waitingUntilEmpty, waitingUntilEmptyNotes } = store.getState().midi;
		engine.handle({
			notes,
			waitingNotes: waitingUntilEmptyNotes,
			waiting: waitingUntilEmpty,
			index: 0,
			dispatch,
		});
	});
	await Promise.resolve();
	return store.posted[0] as { correct: boolean } | undefined;
};

describe('spelling a chord with note names', () => {
	it('offers the note-name pad for chord cards', () => {
		expect(studyInputSelector(setup().getState())).to.equal('spelling');
		expect(studyInputSelector(setup('piano').getState())).to.equal('keyboard');
	});

	it('grades by note names even when the staff is shown', () => {
		expect(selectGradesAnyOctave(setup().getState())).to.equal(true);
		expect(selectGradesAnyOctave(setup('piano').getState())).to.equal(false);
	});

	it('counts the chord tones tapped in any order as correct', async () => {
		expect((await tapAll(setup(), [4, 0, 11, 2]))?.correct).to.equal(true);
	});

	it('counts a wrong note as a miss', async () => {
		const store = setup();
		await tapAll(store, [0, 5]);
		expect(store.getState().scheduler.incorrect).to.equal(true);
		const keys = noteNamePadKeysSelector(store.getState());
		expect(keys[5]).to.include({ label: 'F', held: true, wrong: true });
		expect(keys[0]).to.include({ label: 'C', held: true, wrong: false });
	});

	it('lifts a note when it is tapped again', () => {
		const store = setup();
		store.dispatch(tapNoteName(1));
		store.dispatch(tapNoteName(1));
		expect(store.getState().midi.notes).to.deep.equal([]);
		expect(noteNamePadKeysSelector(store.getState())[1].label).to.equal('C♯/D♭');
	});
});

import { expect } from 'chai';
import { ChordMemoryValidatorEngine } from './ChordMemoryValidatorEngine';
import { ChordMemoryChord } from '../types/Cards';
import { createMockDispatch } from './createMockDispatch';

describe('ChordMemoryValidatorEngine', () => {
	describe('validate', () => {
		it('accepts correct major chord in same octave', () => {
			const gMajor: ChordMemoryChord = {
				chordName: 'G',
				requiredTones: ['G', 'B', 'D'],
				optionalTones: [],
			};
			const engine = new ChordMemoryValidatorEngine([gMajor]);
			const result = engine.validate([55, 59, 62], gMajor);
			expect(result.isCorrect).to.be.true;
			expect(result.isIncomplete).to.be.false;
			expect(result.wrongNotes).to.have.length(0);
		});

		it('accepts correct minor chord spread across octaves', () => {
			const aMinor: ChordMemoryChord = {
				chordName: 'Am',
				requiredTones: ['A', 'C', 'E'],
				optionalTones: [],
			};
			const engine = new ChordMemoryValidatorEngine([aMinor]);
			const result = engine.validate([45, 60, 76], aMinor);
			expect(result.isCorrect).to.be.true;
			expect(result.isIncomplete).to.be.false;
			expect(result.wrongNotes).to.have.length(0);
		});

		it('rejects dominant 7th chord when non-chord-tone is played', () => {
			const g7: ChordMemoryChord = {
				chordName: 'G7',
				requiredTones: ['G', 'B', 'D', 'F'],
				optionalTones: [],
			};
			const engine = new ChordMemoryValidatorEngine([g7]);
			const result = engine.validate([55, 59, 62, 65, 64], g7);
			expect(result.isCorrect).to.be.false;
			expect(result.wrongNotes).to.include(64);
		});

		it('marks diminished chord incomplete when missing required tone', () => {
			const bDim: ChordMemoryChord = {
				chordName: 'Bdim',
				requiredTones: ['B', 'D', 'F'],
				optionalTones: [],
			};
			const engine = new ChordMemoryValidatorEngine([bDim]);
			const result = engine.validate([59, 62], bDim);
			expect(result.isCorrect).to.be.false;
			expect(result.isIncomplete).to.be.true;
			expect(result.wrongNotes).to.have.length(0);
		});

		it('accepts minor 7th chord with optional tone omitted', () => {
			const dm7: ChordMemoryChord = {
				chordName: 'Dm7',
				requiredTones: ['D', 'F', 'A'],
				optionalTones: ['C'],
			};
			const engine = new ChordMemoryValidatorEngine([dm7]);
			const result = engine.validate([62, 65, 69], dm7);
			expect(result.isCorrect).to.be.true;
			expect(result.isIncomplete).to.be.false;
			expect(result.wrongNotes).to.have.length(0);
		});

		it('accepts major 7th chord with optional tone included', () => {
			const fMaj7: ChordMemoryChord = {
				chordName: 'Fmaj7',
				requiredTones: ['F', 'A', 'C'],
				optionalTones: ['E'],
			};
			const engine = new ChordMemoryValidatorEngine([fMaj7]);
			const result = engine.validate([53, 57, 60, 64], fMaj7);
			expect(result.isCorrect).to.be.true;
			expect(result.isIncomplete).to.be.false;
			expect(result.wrongNotes).to.have.length(0);
		});

		it('does NOT mark optional tones as wrong when played with incomplete chord', () => {
			const eMaj7: ChordMemoryChord = {
				chordName: 'Emaj7',
				requiredTones: ['E', 'G#', 'B'],
				optionalTones: ['D#'],
			};
			const engine = new ChordMemoryValidatorEngine([eMaj7]);
			const result = engine.validate([52, 56, 63], eMaj7);
			expect(result.wrongNotes).to.have.length(0);
			expect(result.isIncomplete).to.be.true;
		});
	});

	describe('handle', () => {
		it('skips validation while waiting', () => {
			const cMajor: ChordMemoryChord = {
				chordName: 'C',
				requiredTones: ['C', 'E', 'G'],
				optionalTones: [],
			};
			const engine = new ChordMemoryValidatorEngine([cMajor]);
			const { actions, dispatch } = createMockDispatch();
			engine.handle({ onNotes: [60, 64, 67], waiting: true, index: 0, dispatch });
			expect(actions).to.have.length(0);
		});

		it('advances progression after correct augmented chord', () => {
			const cAug: ChordMemoryChord = {
				chordName: 'Caug',
				requiredTones: ['C', 'E', 'G#'],
				optionalTones: [],
			};
			const fMinor: ChordMemoryChord = {
				chordName: 'Fm',
				requiredTones: ['F', 'Ab', 'C'],
				optionalTones: [],
			};
			const engine = new ChordMemoryValidatorEngine([cAug, fMinor]);
			const { actions, dispatch } = createMockDispatch();
			engine.handle({ onNotes: [60, 64, 68], waiting: false, index: 0, dispatch });
			const actionTypes = actions.map((a) => a.type).filter(Boolean);
			expect(actionTypes).to.include('scheduler/incrementMultiPartCardIndex');
		});

		it('records correct attempt when last sus4 chord is correct', () => {
			const dSus4: ChordMemoryChord = {
				chordName: 'Dsus4',
				requiredTones: ['D', 'G', 'A'],
				optionalTones: [],
			};
			const engine = new ChordMemoryValidatorEngine([dSus4]);
			const { actions, dispatch } = createMockDispatch();
			engine.handle({ onNotes: [62, 67, 69], waiting: false, index: 0, dispatch });
			expect(actions.length).to.be.greaterThan(0);
			const actionTypes = actions.map((a) => a.type).filter(Boolean);
			expect(actionTypes).to.include('midi/waitUntilEmpty');
		});

		it('records wrong attempt when wrong note played on half-diminished chord', () => {
			const bm7b5: ChordMemoryChord = {
				chordName: 'Bm7b5',
				requiredTones: ['B', 'D', 'F', 'A'],
				optionalTones: [],
			};
			const engine = new ChordMemoryValidatorEngine([bm7b5]);
			const { actions, dispatch } = createMockDispatch();
			engine.handle({ onNotes: [59, 62, 65, 69, 60], waiting: false, index: 0, dispatch });
			const actionTypes = actions.map((a) => a.type).filter(Boolean);
			expect(actionTypes).to.include('midi/addWrongNote');
			expect(actionTypes).to.include('midi/waitUntilEmpty');
		});
	});
});

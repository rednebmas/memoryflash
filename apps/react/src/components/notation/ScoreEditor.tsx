import React, { useEffect, useRef, useState } from 'react';
import { shallowEqual } from 'react-redux';
import { MusicNotation } from '../MusicNotation';
import { StepTimeController } from 'MemoryFlashCore/src/lib/stepTimeController';
import { scoreToQuestion } from 'MemoryFlashCore/src/lib/scoreBuilder';
import { Duration, BaseDuration } from 'MemoryFlashCore/src/lib/measure';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import { SheetNote, MultiSheetQuestion } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { Staff } from 'MemoryFlashCore/src/lib/score';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { Midi } from 'tonal';
import { majorKey } from '@tonaljs/key';
import { ScoreToolbar } from './ScoreToolbar';
import { Score } from 'MemoryFlashCore/src/lib/score';

interface Props {
	keySig: string;
	onChange: (q: MultiSheetQuestion, full: boolean) => void;
	resetSignal: number;
}

const toSheet = (m: number, key: string): SheetNote => {
	const useSharps = majorKey(key).alteration > 0;
	const name = Midi.midiToNoteName(m, { sharps: useSharps });
	const match = name.match(/([A-G][#b]?)(\d+)/)!;
	return { name: match[1], octave: parseInt(match[2]) };
};

const isFull = (score: Score) => {
	const m = score.measures[score.measures.length - 1] ?? {};
	const trebleBeat = m[StaffEnum.Treble]?.voices[0]?.beat ?? 0;
	const bassBeat = m[StaffEnum.Bass]?.voices[0]?.beat ?? 0;
	return trebleBeat === score.beatsPerMeasure && bassBeat === score.beatsPerMeasure;
};
function useStepCtrl(
	keySig: string,
	resetSignal: number,
	onChange: (q: MultiSheetQuestion, full: boolean) => void,
) {
	const ctrlRef = useRef(new StepTimeController());
	const [dur, setDurState] = useState<BaseDuration>('q');
	const [dotted, setDotted] = useState(false);
	const [staff, setStaff] = useState<Staff>(StaffEnum.Treble);
	const midi = useAppSelector((s) => s.midi.notes.map((n) => n.number), shallowEqual);
	const prev = useRef<number[]>([]);
	const maxChord = useRef<number[]>([]);
	const emit = () => {
		const ctrl = ctrlRef.current;
		let displayScore = ctrl.score;
		if (maxChord.current.length > 0) {
			displayScore = ctrl.score.clone();
			displayScore.addNote(ctrl.staff, maxChord.current.map((m) => toSheet(m, keySig)), ctrl.duration, ctrl.voice);
		}
		onChange(scoreToQuestion(displayScore, keySig), isFull(displayScore));
	};
	const applyDur = () => ctrlRef.current.setDuration((dotted ? `${dur}d` : dur) as Duration);
	useEffect(() => {
		if (!shallowEqual(prev.current, midi)) {
			if (midi.length > 0) {
				const currentSet = new Set(maxChord.current);
				midi.forEach((m) => currentSet.add(m));
				maxChord.current = Array.from(currentSet).sort((a, b) => a - b);
			}
			if (midi.length === 0 && prev.current.length > 0) {
				ctrlRef.current.input(maxChord.current.map((m) => toSheet(m, keySig)));
				maxChord.current = [];
			}
			prev.current = [...midi];
			emit();
		}
	}, [midi, keySig]);
	useEffect(() => {
		ctrlRef.current = new StepTimeController();
		applyDur();
		ctrlRef.current.setStaff(staff);
		maxChord.current = [];
		prev.current = [];
		emit();
	}, [resetSignal, keySig]);
	useEffect(applyDur, [dur, dotted]);
	useEffect(() => ctrlRef.current.setStaff(staff), [staff]);
	const addRest = () => {
		ctrlRef.current.input([]);
		emit();
	};
	const setDur = (d: BaseDuration) => {
		setDurState(d);
		setDotted(false);
	};
	return {
		dur,
		dotted,
		setDur,
		toggleDot: () => setDotted((d) => !d),
		staff,
		setStaff,
		addRest,
		score: ctrlRef.current.score,
	};
}

export const ScoreEditor: React.FC<Props> = ({ keySig, onChange, resetSignal }) => {
	const [currentQuestion, setCurrentQuestion] = useState<MultiSheetQuestion>(scoreToQuestion(new Score(), keySig));
	const localOnChange = (q: MultiSheetQuestion, full: boolean) => {
		setCurrentQuestion(q);
		onChange(q, full);
	};
	const { dur, dotted, setDur, toggleDot, staff, setStaff, addRest } = useStepCtrl(
		keySig,
		resetSignal,
		localOnChange,
	);
	return (
		<div className="flex flex-col items-center gap-4">
			<ScoreToolbar
				dur={dur}
				dotted={dotted}
				setDur={setDur}
				toggleDot={toggleDot}
				staff={staff}
				setStaff={setStaff}
				addRest={addRest}
			/>
			<MusicNotation data={currentQuestion} />
		</div>
	);
};

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

const isFull = (c: StepTimeController) => {
	const s = c.score;
	const m = s.measures[s.measures.length - 1];
	return (
		m[StaffEnum.Treble].voices[0].beat === s.beatsPerMeasure &&
		m[StaffEnum.Bass].voices[0].beat === s.beatsPerMeasure
	);
};

const durations: BaseDuration[] = ['w', 'h', 'q', '8'];

interface ToolbarProps {
	dur: BaseDuration;
	dotted: boolean;
	setDur: (d: BaseDuration) => void;
	toggleDot: () => void;
	staff: Staff;
	setStaff: (s: Staff) => void;
	addRest: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
	dur,
	dotted,
	setDur,
	toggleDot,
	staff,
	setStaff,
	addRest,
}) => (
	<div className="flex gap-2">
		{durations.map((d) => (
			<button
				key={d}
				className={`px-2 py-1 border ${dur === d ? 'bg-gray-200' : ''}`}
				onClick={() => setDur(d)}
			>
				{d}
			</button>
		))}
		<button className={`px-2 py-1 border ${dotted ? 'bg-gray-200' : ''}`} onClick={toggleDot}>
			.
		</button>
		<button className="px-2 py-1 border" onClick={addRest}>
			rest
		</button>
		<button
			className={`px-2 py-1 border ${staff === StaffEnum.Treble ? 'bg-gray-200' : ''}`}
			onClick={() => setStaff(StaffEnum.Treble)}
		>
			treble
		</button>
		<button
			className={`px-2 py-1 border ${staff === StaffEnum.Bass ? 'bg-gray-200' : ''}`}
			onClick={() => setStaff(StaffEnum.Bass)}
		>
			bass
		</button>
	</div>
);

function useStepCtrl(
	keySig: string,
	resetSignal: number,
	onChange: (q: MultiSheetQuestion, full: boolean) => void,
) {
	const ctrlRef = useRef(new StepTimeController());
	const [dur, setDur] = useState<BaseDuration>('q');
	const [dotted, setDotted] = useState(false);
	const [staff, setStaff] = useState<Staff>(StaffEnum.Treble);
	const midi = useAppSelector((s) => s.midi.notes.map((n) => n.number), shallowEqual);
	const prev = useRef<number[]>([]);
	const emit = () => {
		const score = ctrlRef.current.score;
		onChange(scoreToQuestion(score, keySig), isFull(ctrlRef.current));
	};
	useEffect(() => {
		if (!shallowEqual(prev.current, midi) && midi.length) {
			ctrlRef.current.input(midi.map((m) => toSheet(m, keySig)));
			prev.current = [...midi];
			emit();
		}
		if (!midi.length) prev.current = [];
	}, [midi, keySig]);
	const applyDur = () => ctrlRef.current.setDuration((dotted ? `${dur}d` : dur) as Duration);
	useEffect(() => {
		ctrlRef.current = new StepTimeController();
		applyDur();
		ctrlRef.current.setStaff(staff);
		emit();
	}, [resetSignal, keySig]);
	useEffect(applyDur, [dur, dotted]);
	useEffect(() => ctrlRef.current.setStaff(staff), [staff]);
	const addRest = () => {
		ctrlRef.current.input([]);
		emit();
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
	const { dur, dotted, setDur, toggleDot, staff, setStaff, addRest, score } = useStepCtrl(
		keySig,
		resetSignal,
		onChange,
	);
	return (
		<div className="flex flex-col items-center gap-4">
			<Toolbar
				dur={dur}
				dotted={dotted}
				setDur={setDur}
				toggleDot={toggleDot}
				staff={staff}
				setStaff={setStaff}
				addRest={addRest}
			/>
			<MusicNotation data={scoreToQuestion(score, keySig)} />
		</div>
	);
};

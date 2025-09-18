import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { shallowEqual } from 'react-redux';
import { MusicNotation } from '../MusicNotation';
import { StepTimeController } from 'MemoryFlashCore/src/lib/stepTimeController';
import { scoreToQuestion } from 'MemoryFlashCore/src/lib/scoreBuilder';
import { Duration, BaseDuration } from 'MemoryFlashCore/src/lib/measure';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import { SheetNote, MultiSheetQuestion } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { Staff, Score } from 'MemoryFlashCore/src/lib/score';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { Midi } from 'tonal';
import { majorKey } from '@tonaljs/key';

type ScoreChangeHandler = (q: MultiSheetQuestion, full: boolean) => void;

interface ScoreEditorContextValue {
	dur: BaseDuration;
	dotted: boolean;
	durations: Duration[];
	setDur: (d: BaseDuration) => void;
	toggleDot: () => void;
	addTieDuration: (d: Duration) => void;
	removeTieDuration: (index: number) => void;
	staff: Staff;
	setStaff: (s: Staff) => void;
	addRest: () => void;
	question: MultiSheetQuestion;
}

const ScoreEditorContext = createContext<ScoreEditorContextValue | null>(null);

export const useScoreEditor = () => {
	const ctx = useContext(ScoreEditorContext);
	if (!ctx) throw new Error('Score editor context is missing');
	return ctx;
};

const toSheet = (m: number, key: string): SheetNote => {
	const useSharps = majorKey(key).alteration > 0;
	const name = Midi.midiToNoteName(m, { sharps: useSharps });
	const match = name.match(/([A-G][#b]?)(\d+)/)!;
	return { name: match[1], octave: parseInt(match[2]) };
};

const isFull = (score: Score) => {
	const measure = score.measures[score.measures.length - 1] ?? {};
	const trebleBeat = measure[StaffEnum.Treble]?.voices[0]?.beat ?? 0;
	const bassBeat = measure[StaffEnum.Bass]?.voices[0]?.beat ?? 0;
	return trebleBeat === score.beatsPerMeasure && bassBeat === score.beatsPerMeasure;
};

function useStepCtrl(keySig: string, resetSignal: number, notify: ScoreChangeHandler) {
	const ctrlRef = useRef(new StepTimeController());
	const [dur, setDurState] = useState<BaseDuration>('q');
	const [dotted, setDotted] = useState(false);
	const [extraDurations, setExtraDurations] = useState<Duration[]>([]);
	const durations = useMemo(() => {
		const base = (dotted ? `${dur}d` : dur) as Duration;
		return [base, ...extraDurations];
	}, [dur, dotted, extraDurations]);
	const [staffState, setStaffState] = useState<Staff>(StaffEnum.Treble);
	const staffRef = useRef<Staff>(StaffEnum.Treble);
	const midi = useAppSelector((s) => s.midi.notes.map((n) => n.number), shallowEqual);
	const prev = useRef<number[]>([]);
	const maxChord = useRef<number[]>([]);
	const [question, setQuestion] = useState(() => scoreToQuestion(new Score(), keySig));

	const emit = useCallback(() => {
		const ctrl = ctrlRef.current;
		let displayScore = ctrl.score;
		if (maxChord.current.length > 0) {
			displayScore = ctrl.score.clone();
			const sheetNotes = maxChord.current.map((m) => toSheet(m, keySig));
			const indexes = sheetNotes.map((_, i) => i);
			const previewDurations = ctrl.durations.length ? ctrl.durations : durations;
			previewDurations.forEach((duration, index) => {
				const tie =
					previewDurations.length > 1 && indexes.length
						? {
								fromPrevious: index > 0 ? [...indexes] : undefined,
								toNext:
									index < previewDurations.length - 1 ? [...indexes] : undefined,
							}
						: undefined;
				displayScore.addNote(ctrl.staff, sheetNotes, duration, ctrl.voice, tie);
			});
		}
		const nextQuestion = scoreToQuestion(displayScore, keySig);
		setQuestion(nextQuestion);
		notify(nextQuestion, isFull(displayScore));
	}, [durations, keySig, notify]);

	const emitRef = useRef(emit);
	useEffect(() => {
		emitRef.current = emit;
	}, [emit]);

	const applyDur = useCallback(() => ctrlRef.current.setDuration(durations), [durations]);
	const applyDurRef = useRef(applyDur);
	useEffect(() => {
		applyDurRef.current = applyDur;
	}, [applyDur]);

	useEffect(() => {
		if (!shallowEqual(prev.current, midi)) {
			if (midi.length > 0) {
				const set = new Set(maxChord.current);
				midi.forEach((m) => set.add(m));
				maxChord.current = Array.from(set).sort((a, b) => a - b);
			}
			if (midi.length === 0 && prev.current.length > 0) {
				const sheetNotes = maxChord.current.map((m) => toSheet(m, keySig));
				ctrlRef.current.input(sheetNotes);
				maxChord.current = [];
			}
			prev.current = [...midi];
			emit();
		}
	}, [emit, midi, keySig]);

	useEffect(() => {
		ctrlRef.current = new StepTimeController();
		applyDurRef.current();
		ctrlRef.current.setStaff(staffRef.current);
		maxChord.current = [];
		prev.current = [];
		emitRef.current();
	}, [resetSignal]);

	useEffect(() => {
		applyDur();
		emit();
	}, [applyDur, emit]);

	useEffect(() => {
		staffRef.current = staffState;
		ctrlRef.current.setStaff(staffState);
	}, [staffState]);

	const setDur = useCallback((d: BaseDuration) => {
		setDurState(d);
		setDotted(false);
		setExtraDurations([]);
	}, []);

	const toggleDot = useCallback(() => setDotted((prevDot) => !prevDot), []);

	const addTieDuration = useCallback(
		(duration: Duration) => setExtraDurations((prevDurations) => [...prevDurations, duration]),
		[],
	);

	const removeTieDuration = useCallback(
		(index: number) =>
			setExtraDurations((prevDurations) => prevDurations.filter((_, i) => i !== index)),
		[],
	);

	const setStaff = useCallback((s: Staff) => setStaffState(s), []);

	const addRest = useCallback(() => {
		ctrlRef.current.input([]);
		emit();
	}, [emit]);

	return {
		dur,
		dotted,
		durations,
		setDur,
		toggleDot,
		addTieDuration,
		removeTieDuration,
		staff: staffState,
		setStaff,
		addRest,
		question,
	};
}

interface ProviderProps {
	keySig: string;
	resetSignal: number;
	onChange: ScoreChangeHandler;
	children: React.ReactNode;
}

export const ScoreEditorProvider: React.FC<ProviderProps> = ({
	keySig,
	resetSignal,
	onChange,
	children,
}) => {
	const value = useStepCtrl(keySig, resetSignal, onChange);
	return <ScoreEditorContext.Provider value={value}>{children}</ScoreEditorContext.Provider>;
};

export const ScoreEditor: React.FC = () => {
	const { question } = useScoreEditor();
	return (
		<div className="flex flex-col items-center gap-4">
			<MusicNotation data={question} />
		</div>
	);
};

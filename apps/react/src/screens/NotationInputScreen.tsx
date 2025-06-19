import React, { useEffect, useRef, useState } from 'react';
import { shallowEqual } from 'react-redux';
import { Layout } from '../components';
import { MusicNotation } from '../components/MusicNotation';
import { NoteDuration } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { majorKeys, notes as allNotes } from 'MemoryFlashCore/src/lib/notes';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { MusicRecorder } from 'MemoryFlashCore/src/lib/MusicRecorder';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import { Select, DurationSelect, InputField } from '../components/inputs';
import { CardTypeDropdown } from '../components/CardTypeDropdown';
import { questionsForAllMajorKeys } from 'MemoryFlashCore/src/lib/multiKeyTransposer';
import { addCardsToDeck } from 'MemoryFlashCore/src/redux/actions/add-cards-to-deck';
import { setPresentationMode } from 'MemoryFlashCore/src/redux/actions/set-presentation-mode';
import { CardTypeEnum } from 'MemoryFlashCore/src/types/Cards';
import { Button } from '../components/Button';
import { KeySelector } from '../components/KeySelector';
import { useDeckIdPath } from './useDeckIdPath';

const NoteSettings: React.FC<{
	keySig: string;
	setKeySig: (k: string) => void;
	trebleDur: NoteDuration;
	setTrebleDur: (d: NoteDuration) => void;
	bassDur: NoteDuration;
	setBassDur: (d: NoteDuration) => void;
}> = ({ keySig, setKeySig, trebleDur, setTrebleDur, bassDur, setBassDur }) => (
	<div className="flex gap-4 pb-4">
		<label className="flex items-center gap-2">
			Key
			<Select value={keySig} onChange={(e) => setKeySig(e.target.value)}>
				{majorKeys.map((k) => (
					<option key={k}>{k}</option>
				))}
			</Select>
		</label>
		<label className="flex items-center gap-2">
			Treble
			<DurationSelect
				value={trebleDur}
				onChange={(e) => setTrebleDur(e.target.value as NoteDuration)}
			/>
		</label>
		<label className="flex items-center gap-2">
			Bass
			<DurationSelect
				value={bassDur}
				onChange={(e) => setBassDur(e.target.value as NoteDuration)}
			/>
		</label>
	</div>
);

const RangeSettings: React.FC<{
	lowest: string;
	setLowest: (n: string) => void;
	highest: string;
	setHighest: (n: string) => void;
}> = ({ lowest, setLowest, highest, setHighest }) => {
	const options = allNotes.flatMap((n) =>
		[3, 4, 5, 6].map((o) => <option key={`${n}${o}`}>{`${n}${o}`}</option>),
	);
	return (
		<div className="flex gap-4 pb-4">
			<label className="flex items-center gap-2">
				Lowest
				<Select value={lowest} onChange={(e) => setLowest(e.target.value)}>
					{options}
				</Select>
			</label>
			<label className="flex items-center gap-2">
				Highest
				<Select value={highest} onChange={(e) => setHighest(e.target.value)}>
					{options}
				</Select>
			</label>
		</div>
	);
};

export const NotationInputScreen = () => {
	const [keySig, setKeySig] = useState(majorKeys[0]);
	const [trebleDur, setTrebleDur] = useState<NoteDuration>('q');
	const [bassDur, setBassDur] = useState<NoteDuration>('q');
	const [lowest, setLowest] = useState('C3');
	const [highest, setHighest] = useState('C5');
	const [selected, setSelected] = useState<boolean[]>(() => majorKeys.map(() => true));
	const [textPrompt, setTextPrompt] = useState('');
	const [cardType, setCardType] = useState<'Sheet Music' | 'Text Prompt'>('Sheet Music');

	const dispatch = useAppDispatch();
	const { deckId } = useDeckIdPath();

	const recorderRef = useRef(new MusicRecorder('q'));
	const midiNotes = useAppSelector(
		(state) => state.midi.notes.map((n) => n.number),
		shallowEqual,
	);

	useEffect(() => {
		recorderRef.current.updateDuration(trebleDur, StaffEnum.Treble);
	}, [trebleDur]);

	useEffect(() => {
		recorderRef.current.updateDuration(bassDur, StaffEnum.Bass);
	}, [bassDur]);

	useEffect(() => {
		recorderRef.current.addMidiNotes(midiNotes);
	}, [midiNotes]);

	const data = recorderRef.current.buildQuestion(keySig);
	const previews = questionsForAllMajorKeys(data, lowest, highest);
	const toggle = (i: number) => setSelected((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
	const selectAll = () => setSelected(majorKeys.map(() => true));
	const selectNone = () => setSelected(majorKeys.map(() => false));

	const handleAdd = () => {
		if (deckId) {
			let toAdd = previews.filter((_, i) => selected[i]);
			if (cardType === 'Text Prompt') {
				toAdd = toAdd.map((q) => ({
					...q,
					presentationModes: [{ id: 'Text Prompt', text: textPrompt }],
				}));
				dispatch(setPresentationMode(CardTypeEnum.MultiSheet, 'Text Prompt'));
			}
			dispatch(addCardsToDeck(deckId, toAdd));
		}
	};

	return (
		<Layout subtitle="Notation Input" back="/">
			<NoteSettings
				keySig={keySig}
				setKeySig={setKeySig}
				trebleDur={trebleDur}
				setTrebleDur={setTrebleDur}
				bassDur={bassDur}
				setBassDur={setBassDur}
			/>
			<RangeSettings
				lowest={lowest}
				setLowest={setLowest}
				highest={highest}
				setHighest={setHighest}
			/>
			<KeySelector
				selected={selected}
				toggle={toggle}
				selectAll={selectAll}
				selectNone={selectNone}
			/>
			<div className="flex flex-col gap-4 pb-4 items-start">
				<div className="flex items-center gap-2">
					<span>Card Type</span>
					<CardTypeDropdown value={cardType} onChange={setCardType} />
				</div>
				{cardType === 'Text Prompt' && (
					<InputField
						id="text-prompt"
						label="Prompt Text"
						value={textPrompt}
						onChange={(e) => setTextPrompt(e.target.value)}
					/>
				)}
			</div>
			<div className="flex flex-col items-center gap-5">
				{previews.map((p, i) => (
					<div key={i} className="flex flex-col items-center gap-2">
						<div className="card-container flex flex-col items-center gap-2 w-[26rem]">
							<MusicNotation data={p} />
						</div>
					</div>
				))}
			</div>
			<div className="pt-4 flex justify-center">
				<Button onClick={handleAdd}>Add Card</Button>
			</div>
		</Layout>
	);
};

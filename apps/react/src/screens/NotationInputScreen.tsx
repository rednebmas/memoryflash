import React, { useEffect, useRef, useState } from 'react';
import { shallowEqual } from 'react-redux';
import { Layout } from '../components';
import { MusicNotation } from '../components/MusicNotation';
import { NoteDuration } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { majorKeys, notes as allNotes } from 'MemoryFlashCore/src/lib/notes';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { MusicRecorder } from 'MemoryFlashCore/src/lib/MusicRecorder';
import { Select } from '../components/inputs';
import { questionsForAllMajorKeys } from 'MemoryFlashCore/src/lib/multiKeyTransposer';
import { addCardsToDeck } from 'MemoryFlashCore/src/redux/actions/add-cards-to-deck';
import { Button } from '../components/Button';
import { CardContainer } from '../components/CardContainer';
import { useDeckIdPath } from './useDeckIdPath';

const NoteSettings: React.FC<{
	keySig: string;
	setKeySig: (k: string) => void;
	dur: NoteDuration;
	setDur: (d: NoteDuration) => void;
}> = ({ keySig, setKeySig, dur, setDur }) => (
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
			Duration
			<Select value={dur} onChange={(e) => setDur(e.target.value as NoteDuration)}>
				{['w', 'h', 'q', '8', '16'].map((d) => (
					<option key={d} value={d}>
						{d}
					</option>
				))}
			</Select>
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
	const [dur, setDur] = useState<NoteDuration>('q');
	const [lowest, setLowest] = useState('C3');
	const [highest, setHighest] = useState('C5');
	const [selected, setSelected] = useState<boolean[]>(() => majorKeys.map(() => true));

	const dispatch = useAppDispatch();
	const { deckId } = useDeckIdPath();

	const recorderRef = useRef(new MusicRecorder('q'));
	const midiNotes = useAppSelector(
		(state) => state.midi.notes.map((n) => n.number),
		shallowEqual,
	);

	useEffect(() => {
		recorderRef.current.updateDuration(dur);
	}, [dur]);

	useEffect(() => {
		recorderRef.current.addMidiNotes(midiNotes);
	}, [midiNotes]);

	const data = recorderRef.current.buildQuestion(keySig);
	const previews = questionsForAllMajorKeys(data, lowest, highest);
	const toggle = (i: number) => setSelected((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

	const handleAdd = () => {
		if (deckId) {
			const toAdd = previews.filter((_, i) => selected[i]);
			dispatch(addCardsToDeck(deckId, toAdd));
		}
	};

	return (
		<Layout subtitle="Notation Input" back="/">
			<NoteSettings keySig={keySig} setKeySig={setKeySig} dur={dur} setDur={setDur} />
			<RangeSettings
				lowest={lowest}
				setLowest={setLowest}
				highest={highest}
				setHighest={setHighest}
			/>
			<div className="flex flex-col items-center gap-4">
				{previews.map((p, i) => (
					<label key={i} className="flex flex-col items-center gap-2">
						<CardContainer className="flex flex-col items-center gap-2 w-[24rem]">
							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={selected[i]}
									onChange={() => toggle(i)}
								/>
								<span className="text-gray-900 dark:text-gray-100">
									{majorKeys[i]}
								</span>
							</div>
							<MusicNotation data={p} />
						</CardContainer>
					</label>
				))}
			</div>
			<div className="pt-4 flex justify-center">
				<Button onClick={handleAdd}>Add Card</Button>
			</div>
		</Layout>
	);
};

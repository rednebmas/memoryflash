import React, { useEffect, useRef, useState } from 'react';
import { Layout } from '../components';
import { MusicNotation } from '../components/MusicNotation';
import { StackedNotes, NoteDuration } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { majorKeys } from 'MemoryFlashCore/src/lib/notes';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { MusicRecorder } from 'MemoryFlashCore/src/lib/MusicRecorder';
import { Select } from '../components/inputs';

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

export const NotationInputScreen = () => {
	const [notes, setNotes] = useState<StackedNotes[]>([]);
	const [keySig, setKeySig] = useState(majorKeys[0]);
	const [dur, setDur] = useState<NoteDuration>('q');

	const recorderRef = useRef(new MusicRecorder('q'));
	const midiNotes = useAppSelector((state) => state.midi.notes.map((n) => n.number));

	useEffect(() => {
		recorderRef.current.updateDuration(dur);
	}, [dur]);

	useEffect(() => {
		recorderRef.current.addMidiNotes(midiNotes);
		setNotes([...recorderRef.current.notes]);
	}, [midiNotes]);

	const data = recorderRef.current.buildQuestion(keySig);

	return (
		<Layout subtitle="Notation Input" back="/">
			<NoteSettings keySig={keySig} setKeySig={setKeySig} dur={dur} setDur={setDur} />
			<MusicNotation data={data} />
		</Layout>
	);
};

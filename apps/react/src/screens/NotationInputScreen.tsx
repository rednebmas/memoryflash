import React, { useEffect, useState } from 'react';
import { Midi } from 'tonal';
import { Layout } from '../components';
import { MusicNotation } from '../components/MusicNotation';
import { Select } from '../components/inputs';
import { majorKeys } from 'MemoryFlashCore/src/lib/notes';
import { buildMultiSheetQuestion } from 'MemoryFlashCore/src/lib/notationBuilder';
import { StackedNotes } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import usePrevious from '../utils/usePrevious';

const NoteSettings: React.FC<{
	keySig: string;
	setKeySig: (k: string) => void;
	dur: StackedNotes['duration'];
	setDur: (d: StackedNotes['duration']) => void;
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
			<Select value={dur} onChange={(e) => setDur(e.target.value as any)}>
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
	const [dur, setDur] = useState<StackedNotes['duration']>('q');
	const midiNotes = useAppSelector((s) => s.midi.notes);
	const prevMidi = usePrevious(midiNotes);

	useEffect(() => {
		midiNotes.forEach((n) => {
			if (prevMidi?.find((p) => p.number === n.number)) return;
			const noteName = Midi.midiToNoteName(n.number);
			const [name, octaveStr] = noteName.split(/(?=\d)/);
			setNotes((p) => [
				...p,
				{ notes: [{ name, octave: Number(octaveStr) }], duration: dur },
			]);
		});
	}, [midiNotes, prevMidi, dur]);

	const data = buildMultiSheetQuestion(notes, keySig);

	return (
		<Layout subtitle="Notation Input" back="/">
			<NoteSettings keySig={keySig} setKeySig={setKeySig} dur={dur} setDur={setDur} />
			<MusicNotation data={data} />
		</Layout>
	);
};

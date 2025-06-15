import React, { useEffect, useState } from 'react';
import { Layout } from '../components';
import { MusicNotation } from '../components/MusicNotation';
import { StackedNotes } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { majorKeys } from 'MemoryFlashCore/src/lib/notes';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import usePrevious from '../utils/usePrevious';
import { Midi } from 'tonal';
import { Select } from '../components/inputs';
import { insertRestsToFillBars } from 'MemoryFlashCore/src/lib/measure';
import { buildMultiSheetQuestion } from 'MemoryFlashCore/src/lib/notationBuilder';

const NoteSettings: React.FC<{
	keySig: string;
	setKeySig: (k: string) => void;
	dur: string;
	setDur: (d: string) => void;
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
			<Select value={dur} onChange={(e) => setDur(e.target.value)}>
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
	const [dur, setDur] = useState('q');

	const midiNotes = useAppSelector((state) => state.midi.notes.map((n) => n.number));
	const prevMidiNotes = usePrevious(midiNotes) || [];

	useEffect(() => {
		const added = midiNotes.filter((m) => !prevMidiNotes.includes(m));
		if (added.length) {
			const sheetNotes = added.map((m) => {
				const name = Midi.midiToNoteName(m);
				const match = name.match(/([A-G][#b]?)(\d+)/)!;
				return { name: match[1], octave: parseInt(match[2]) };
			});
			setNotes((n) => [...n, { notes: sheetNotes, duration: dur as any }]);
		}
	}, [midiNotes, prevMidiNotes, dur]);

	useEffect(() => {
		const onDown = (e: KeyboardEvent) => {
			if (e.key === 'Backspace') {
				setNotes((n) => n.slice(0, -1));
			}
		};
		window.addEventListener('keydown', onDown);
		return () => window.removeEventListener('keydown', onDown);
	}, []);

	const data = buildMultiSheetQuestion(insertRestsToFillBars(notes), keySig);

	return (
		<Layout subtitle="Notation Input" back="/">
			<NoteSettings keySig={keySig} setKeySig={setKeySig} dur={dur} setDur={setDur} />
			<MusicNotation data={data} />
		</Layout>
	);
};

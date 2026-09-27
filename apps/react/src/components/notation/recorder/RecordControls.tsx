import React from 'react';
import { InlineSelect } from '../../inputs/InlineSelect';
import { RHYTHM_BPM_OPTIONS } from 'MemoryFlashCore/src/lib/rhythm/types';

const BPM_OPTIONS = RHYTHM_BPM_OPTIONS.map((bpm) => ({ value: bpm, label: `${bpm} bpm` }));
const QUANTIZE_OPTIONS = [
	{ value: 2, label: '8th notes' },
	{ value: 4, label: '16th notes' },
];

interface RecordControlsProps {
	bpm: number;
	stepsPerBeat: number;
	onChange: (changes: { bpm?: number; stepsPerBeat?: number }) => void;
}

export const RecordControls: React.FC<RecordControlsProps> = ({ bpm, stepsPerBeat, onChange }) => (
	<div className="flex flex-wrap items-center gap-3">
		<InlineSelect
			label="Tempo"
			value={bpm}
			options={BPM_OPTIONS}
			onChange={(v) => onChange({ bpm: v })}
		/>
		<InlineSelect
			label="Quantize to"
			value={stepsPerBeat}
			options={QUANTIZE_OPTIONS}
			onChange={(v) => onChange({ stepsPerBeat: v })}
		/>
	</div>
);

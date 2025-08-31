import React from 'react';
import { Select } from '../inputs';
import { notes as allNotes } from 'MemoryFlashCore/src/lib/notes';

interface RangeSettingsProps {
	lowest: string;
	highest: string;
	onChange: (changes: Partial<{ lowest: string; highest: string }>) => void;
}

export const RangeSettings: React.FC<RangeSettingsProps> = ({ lowest, highest, onChange }) => {
	const options = allNotes.flatMap((n) =>
		[3, 4, 5, 6].map((o) => <option key={`${n}${o}`}>{`${n}${o}`}</option>),
	);
	return (
		<div className="flex gap-4">
			<label className="flex items-center gap-2">
				Lowest
				<Select value={lowest} onChange={(e) => onChange({ lowest: e.target.value })}>
					{options}
				</Select>
			</label>
			<label className="flex items-center gap-2">
				Highest
				<Select value={highest} onChange={(e) => onChange({ highest: e.target.value })}>
					{options}
				</Select>
			</label>
		</div>
	);
};

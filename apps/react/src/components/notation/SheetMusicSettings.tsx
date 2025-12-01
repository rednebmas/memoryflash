import React from 'react';
import { Select, NumberInput } from '../inputs';
import { majorKeys } from 'MemoryFlashCore/src/lib/notes';
import { SettingsSection } from './SettingsSection';
import { ScoreToolbar } from './ScoreToolbar';

interface SheetMusicSettingsProps {
	keySig: string;
	bars: number;
	onChange: (changes: Partial<{ keySig: string; bars: number }>) => void;
}

export const SheetMusicSettings: React.FC<SheetMusicSettingsProps> = ({
	keySig,
	bars,
	onChange,
}) => (
	<SettingsSection title="Sheet Music Settings">
		<div className="space-y-4">
			<div className="flex gap-4">
				<label className="flex items-center gap-2">
					Key
					<Select value={keySig} onChange={(e) => onChange({ keySig: e.target.value })}>
						{majorKeys.map((k) => (
							<option key={k}>{k}</option>
						))}
					</Select>
				</label>
				<label className="flex items-center gap-2">
					Bars
					<NumberInput
						className="w-16"
						min={1}
						value={bars}
						onChange={(e) => onChange({ bars: parseInt(e.target.value, 10) || 1 })}
					/>
				</label>
			</div>
			<ScoreToolbar />
		</div>
	</SettingsSection>
);

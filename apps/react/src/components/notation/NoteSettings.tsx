import React from 'react';
import { Select } from '../inputs';
import { majorKeys } from 'MemoryFlashCore/src/lib/notes';
import { SettingsSection } from './SettingsSection';
import { ScoreToolbar } from './ScoreToolbar';

interface NoteSettingsProps {
	keySig: string;
	onChange: (changes: Partial<{ keySig: string }>) => void;
}

export const NoteSettings: React.FC<NoteSettingsProps> = ({ keySig, onChange }) => (
	<SettingsSection title="Note Settings">
		<div className="space-y-4">
			<label className="flex items-center gap-2">
				Key
				<Select value={keySig} onChange={(e) => onChange({ keySig: e.target.value })}>
					{majorKeys.map((k) => (
						<option key={k}>{k}</option>
					))}
				</Select>
			</label>
			<ScoreToolbar />
		</div>
	</SettingsSection>
);

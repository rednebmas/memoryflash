import React from 'react';
import { Select, DurationSelect } from '../inputs';
import { majorKeys } from 'MemoryFlashCore/src/lib/notes';
import { NoteDuration } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { SettingsSection } from './SettingsSection';

interface NoteSettingsProps {
	keySig: string;
	trebleDur: NoteDuration;
	bassDur: NoteDuration;
	onChange: (
		changes: Partial<{ keySig: string; trebleDur: NoteDuration; bassDur: NoteDuration }>,
	) => void;
}

export const NoteSettings: React.FC<NoteSettingsProps> = ({
	keySig,
	trebleDur,
	bassDur,
	onChange,
}) => (
	<SettingsSection title="Note Settings">
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
				Treble
				<DurationSelect
					value={trebleDur}
					onChange={(e) => onChange({ trebleDur: e.target.value as NoteDuration })}
				/>
			</label>
			<label className="flex items-center gap-2">
				Bass
				<DurationSelect
					value={bassDur}
					onChange={(e) => onChange({ bassDur: e.target.value as NoteDuration })}
				/>
			</label>
		</div>
	</SettingsSection>
);

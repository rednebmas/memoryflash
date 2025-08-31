import React from 'react';
import { TranspositionSelector } from '../TranspositionSelector';
import { majorKeys } from 'MemoryFlashCore/src/lib/notes';
import { NotationSettingsState } from './defaultSettings';
import { NoteSettings } from './NoteSettings';
import { SettingsSection } from './SettingsSection';
import { RangeSettings } from './RangeSettings';
import { CardTypeOptions } from './CardTypeOptions';
import { BarsSetting } from './BarsSetting';

interface NotationSettingsProps {
	settings: NotationSettingsState;
	onChange: (settings: NotationSettingsState) => void;
}

export const NotationSettings: React.FC<NotationSettingsProps> = ({ settings, onChange }) => {
	const update = (changes: Partial<NotationSettingsState>) => {
		let next: NotationSettingsState = { ...settings, ...changes };
		if (changes.keySig) {
			const idx = majorKeys.indexOf(changes.keySig);
			next.selected = next.selected.map((_, i) => i === idx);
		}
		onChange(next);
	};

	return (
		<div className="space-y-4">
			<NoteSettings
				keySig={settings.keySig}
				trebleDur={settings.trebleDur}
				bassDur={settings.bassDur}
				onChange={update}
			/>
			<RangeSettings lowest={settings.lowest} highest={settings.highest} onChange={update} />
			<BarsSetting bars={settings.bars} setBars={(n) => update({ bars: n })} />
			<SettingsSection title="Transpositions">
				<TranspositionSelector
					selected={settings.selected}
					onChange={(selected) => update({ selected })}
					currentKeySig={settings.keySig}
				/>
			</SettingsSection>
			<CardTypeOptions
				cardType={settings.cardType}
				textPrompt={settings.textPrompt}
				preview={settings.preview}
				onChange={update}
			/>
		</div>
	);
};

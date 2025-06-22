import React, { useEffect, useState } from 'react';
import { KeySelector } from '../KeySelector';
import { majorKeys } from 'MemoryFlashCore/src/lib/notes';
import { defaultSettings, NotationSettingsState } from './defaultSettings';
import { NoteSettings } from './NoteSettings';
import { SettingsSection } from './SettingsSection';
import { RangeSettings } from './RangeSettings';
import { CardTypeOptions } from './CardTypeOptions';

interface NotationSettingsProps {
	onChange: (settings: NotationSettingsState) => void;
}

export const NotationSettings: React.FC<NotationSettingsProps> = ({ onChange }) => {
	const [state, setState] = useState<NotationSettingsState>(defaultSettings);

	useEffect(() => {
		onChange(state);
	}, [state]);

	const update = (changes: Partial<NotationSettingsState>) =>
		setState((prev) => {
			const next: NotationSettingsState = { ...prev, ...changes };
			if (changes.keySig) {
				const idx = majorKeys.indexOf(changes.keySig);
				const sel = [...next.selected];
				sel[idx] = true;
				next.selected = sel;
			}
			return next;
		});

	return (
		<div className="space-y-4">
			<NoteSettings
				keySig={state.keySig}
				trebleDur={state.trebleDur}
				bassDur={state.bassDur}
				onChange={update}
			/>
			<RangeSettings lowest={state.lowest} highest={state.highest} onChange={update} />
			<SettingsSection title="Keys">
				<KeySelector
					selected={state.selected}
					currentIndex={majorKeys.indexOf(state.keySig)}
					onChange={(selected) => update({ selected })}
				/>
			</SettingsSection>
			<CardTypeOptions
				cardType={state.cardType}
				textPrompt={state.textPrompt}
				preview={state.preview}
				onChange={update}
			/>
		</div>
	);
};

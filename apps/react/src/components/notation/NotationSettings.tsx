import React, { useEffect, useState } from 'react';
import { KeySelector } from '../KeySelector';
import { defaultSettings, NotationSettingsState } from './defaultSettings';
import { NoteSettings } from './NoteSettings';
import { SettingsSection } from './SettingsSection';
import { RangeSettings } from './RangeSettings';
import { CardTypeOptions } from './CardTypeOptions';
import { BarsSetting } from './BarsSetting';

interface NotationSettingsProps {
	onChange: (settings: NotationSettingsState) => void;
}

export const NotationSettings: React.FC<NotationSettingsProps> = ({ onChange }) => {
	const [state, setState] = useState<NotationSettingsState>(defaultSettings);

	useEffect(() => {
		onChange(state);
	}, [state]);

	const update = (changes: Partial<NotationSettingsState>) =>
		setState((prev) => ({ ...prev, ...changes }));

	return (
		<div className="space-y-4">
			<NoteSettings
				keySig={state.keySig}
				trebleDur={state.trebleDur}
				bassDur={state.bassDur}
				onChange={update}
			/>
			<RangeSettings lowest={state.lowest} highest={state.highest} onChange={update} />
			<BarsSetting bars={state.bars} setBars={(n) => update({ bars: n })} />
			<SettingsSection title="Keys">
				<KeySelector
					selected={state.selected}
					toggle={(i) =>
						update({ selected: state.selected.map((v, idx) => (idx === i ? !v : v)) })
					}
					selectAll={() => update({ selected: state.selected.map(() => true) })}
					selectNone={() => update({ selected: state.selected.map(() => false) })}
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

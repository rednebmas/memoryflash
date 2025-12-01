import React from 'react';
import { TranspositionSelector } from '../TranspositionSelector';
import { majorKeys } from 'MemoryFlashCore/src/lib/notes';
import { NotationSettingsState } from './defaultSettings';
import { SheetMusicSettings } from './SheetMusicSettings';
import { SettingsSection } from './SettingsSection';
import { RangeSettings } from './RangeSettings';
import { CardTypeOptions } from './CardTypeOptions';

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

	const currentKeyIdx = majorKeys.indexOf(settings.keySig);
	const hasTranspositions = settings.selected.some(
		(selected, i) => selected && i !== currentKeyIdx,
	);

	const isChordMemory = settings.cardType === 'Chord Memory';

	return (
		<div className="space-y-4">
			<CardTypeOptions settings={settings} onChange={update} />
			{!isChordMemory && (
				<SheetMusicSettings
					keySig={settings.keySig}
					bars={settings.bars}
					onChange={update}
				/>
			)}
			<SettingsSection
				title="Transpositions"
				collapsible={true}
				collapsedByDefault={true}
				hintText={!hasTranspositions ? 'No transpositions' : undefined}
			>
				<div className="space-y-4">
					<RangeSettings
						lowest={settings.lowest}
						highest={settings.highest}
						onChange={update}
					/>
					<TranspositionSelector
						selected={settings.selected}
						onChange={(selected) => update({ selected })}
						currentKeySig={settings.keySig}
					/>
				</div>
			</SettingsSection>
		</div>
	);
};

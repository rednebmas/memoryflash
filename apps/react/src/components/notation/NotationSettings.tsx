import React from 'react';
import { TranspositionSelector } from '../TranspositionSelector';
import { majorKeys } from 'MemoryFlashCore/src/lib/notes';
import { NotationSettingsState } from './defaultSettings';
import { SheetMusicSettings } from './SheetMusicSettings';
import { SettingsSection } from './SettingsSection';
import { RangeSettings } from './RangeSettings';
import { CardTypeOptions } from './CardTypeOptions';
import { ChordNamesSettings } from './ChordNamesSettings';

const transpositionsHint = (selected: boolean, copies: number) => {
	if (copies) return `${copies} ${copies === 1 ? 'key' : 'keys'} already in this deck`;
	return selected ? undefined : 'None selected — click to choose keys';
};

interface NotationSettingsProps {
	settings: NotationSettingsState;
	onChange: (settings: NotationSettingsState) => void;
	copyKeys: string[];
}

export const NotationSettings: React.FC<NotationSettingsProps> = ({
	settings,
	onChange,
	copyKeys,
}) => {
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
	const isAi = settings.cardType === 'Generate with AI';

	return (
		<div className="space-y-4">
			<CardTypeOptions settings={settings} onChange={update} />
			{!isChordMemory && !isAi && (
				<>
					<SheetMusicSettings settings={settings} onChange={update} />
					<ChordNamesSettings settings={settings} onChange={update} />
				</>
			)}
			{!isAi && (
				<SettingsSection
					title="Transpositions"
					collapsible={true}
					collapsedByDefault={true}
					hintText={transpositionsHint(hasTranspositions, copyKeys.length)}
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
							existingKeys={copyKeys}
						/>
					</div>
				</SettingsSection>
			)}
		</div>
	);
};

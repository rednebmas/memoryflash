import React from 'react';
import { useParams } from 'react-router-dom';
import { TranspositionSelector } from '../TranspositionSelector';
import { majorKeys } from 'MemoryFlashCore/src/lib/notes';
import { onePerPitch, sameKey } from 'MemoryFlashCore/src/lib/transpositionGroups';
import { NotationSettingsState } from './defaultSettings';
import { SheetMusicSettings } from './SheetMusicSettings';
import { SettingsSection } from './SettingsSection';
import { RangeSettings } from './RangeSettings';
import { CardTypeOptions } from './CardTypeOptions';
import { ChordNamesSettings } from './ChordNamesSettings';

const transpositionsHint = (selected: boolean[]) => {
	const keys = majorKeys.filter((_, i) => selected[i]);
	const count = onePerPitch(keys, (k) => k).length;
	return count > 1 ? `${count} keys selected` : 'None selected — click to choose keys';
};

interface NotationSettingsProps {
	settings: NotationSettingsState;
	onChange: (settings: NotationSettingsState) => void;
}

export const NotationSettings: React.FC<NotationSettingsProps> = ({ settings, onChange }) => {
	const update = (changes: Partial<NotationSettingsState>) => {
		let next: NotationSettingsState = { ...settings, ...changes };
		if (changes.keySig) {
			next.selected = majorKeys.map((k) => sameKey(k, changes.keySig));
		}
		onChange(next);
	};

	const { cardId } = useParams();
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
					hintText={transpositionsHint(settings.selected)}
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
						{cardId && (
							<p className="text-sm text-muted">
								Unticking a key hides its card and keeps its history. Tick it again
								to bring it back.
							</p>
						)}
					</div>
				</SettingsSection>
			)}
		</div>
	);
};

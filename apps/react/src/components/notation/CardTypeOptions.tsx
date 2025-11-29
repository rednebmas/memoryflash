import React from 'react';
import { CardTypeDropdown } from '../CardTypeDropdown';
import { InputField, Checkbox } from '../inputs';
import { SettingsSection } from './SettingsSection';
import { ChordProgressionInput } from './ChordProgressionInput';
import { NotationSettingsState } from './defaultSettings';

interface CardTypeOptionsProps {
	settings: NotationSettingsState;
	onChange: (changes: Partial<NotationSettingsState>) => void;
}

export const CardTypeOptions: React.FC<CardTypeOptionsProps> = ({ settings, onChange }) => (
	<SettingsSection title="Card Type">
		<div className="flex flex-col gap-4 items-start">
			<div className="flex items-center gap-2">
				<CardTypeDropdown
					value={settings.cardType}
					onChange={(cardType) => onChange({ cardType })}
				/>
			</div>
			{settings.cardType === 'Text Prompt' && (
				<>
					<InputField
						id="text-prompt"
						label="Prompt Text"
						value={settings.textPrompt}
						onChange={(e) => onChange({ textPrompt: e.target.value })}
					/>
					<label className="flex items-center gap-2">
						<Checkbox
							checked={settings.preview}
							onChange={(e) => onChange({ preview: e.target.checked })}
						/>
						<span>Preview</span>
					</label>
				</>
			)}
			{settings.cardType === 'Chord Memory' && (
				<ChordProgressionInput
					chordMemory={settings.chordMemory}
					onChange={(chordMemory) => onChange({ chordMemory })}
				/>
			)}
		</div>
	</SettingsSection>
);

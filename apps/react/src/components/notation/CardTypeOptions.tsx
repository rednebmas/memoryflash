import React from 'react';
import { CardTypeDropdown, CardType } from '../CardTypeDropdown';
import { InputField, Checkbox } from '../inputs';
import { SettingsSection } from './SettingsSection';

interface CardTypeOptionsProps {
	cardType: CardType;
	textPrompt: string;
	preview: boolean;
	onChange: (
		changes: Partial<{
			cardType: CardType;
			textPrompt: string;
			preview: boolean;
		}>,
	) => void;
}

export const CardTypeOptions: React.FC<CardTypeOptionsProps> = ({
	cardType,
	textPrompt,
	preview,
	onChange,
}) => (
	<SettingsSection title="Card Type">
		<div className="flex flex-col gap-4 items-start">
			<div className="flex items-center gap-2">
				<CardTypeDropdown value={cardType} onChange={(v) => onChange({ cardType: v })} />
			</div>
			{cardType === 'Text Prompt' && (
				<>
					<InputField
						id="text-prompt"
						label="Prompt Text"
						value={textPrompt}
						onChange={(e) => onChange({ textPrompt: e.target.value })}
					/>
					<label className="flex items-center gap-2">
						<Checkbox
							checked={preview}
							onChange={(e) => onChange({ preview: e.target.checked })}
						/>
						<span>Preview</span>
					</label>
				</>
			)}
		</div>
	</SettingsSection>
);

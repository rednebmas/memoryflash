import React from 'react';
import { CardTypeDropdown } from '../CardTypeDropdown';
import { InputField } from '../inputs';
import { SettingsSection } from './SettingsSection';

interface CardTypeOptionsProps {
	cardType: 'Sheet Music' | 'Text Prompt';
	textPrompt: string;
	onChange: (
		changes: Partial<{ cardType: 'Sheet Music' | 'Text Prompt'; textPrompt: string }>,
	) => void;
}

export const CardTypeOptions: React.FC<CardTypeOptionsProps> = ({
	cardType,
	textPrompt,
	onChange,
}) => (
	<SettingsSection title="Card Type">
		<div className="flex flex-col gap-4 items-start">
			<div className="flex items-center gap-2">
				<span>Card Type</span>
				<CardTypeDropdown value={cardType} onChange={(v) => onChange({ cardType: v })} />
			</div>
			{cardType === 'Text Prompt' && (
				<InputField
					id="text-prompt"
					label="Prompt Text"
					value={textPrompt}
					onChange={(e) => onChange({ textPrompt: e.target.value })}
				/>
			)}
		</div>
	</SettingsSection>
);

import React from 'react';
import Dropdown from './Dropdown';

const CARD_TYPES = ['Sheet Music', 'Text Prompt', 'Chord Memory', 'Generate with AI'] as const;

export type CardType = (typeof CARD_TYPES)[number];

export interface CardTypeDropdownProps {
	value: CardType;
	onChange: (val: CardType) => void;
}

export const CardTypeDropdown: React.FC<CardTypeDropdownProps> = ({ value, onChange }) => (
	<Dropdown
		label={value}
		items={CARD_TYPES.map((label) => ({ label, onClick: () => onChange(label) }))}
	/>
);

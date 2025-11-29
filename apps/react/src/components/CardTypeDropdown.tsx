import React from 'react';
import Dropdown from './Dropdown';

export type CardType = 'Sheet Music' | 'Text Prompt' | 'Chord Memory';

export interface CardTypeDropdownProps {
	value: CardType;
	onChange: (val: CardType) => void;
}

export const CardTypeDropdown: React.FC<CardTypeDropdownProps> = ({ value, onChange }) => {
	const items: { label: CardType; onClick: () => void }[] = [
		{ label: 'Sheet Music', onClick: () => onChange('Sheet Music') },
		{ label: 'Text Prompt', onClick: () => onChange('Text Prompt') },
		{ label: 'Chord Memory', onClick: () => onChange('Chord Memory') },
	];
	return <Dropdown label={value} items={items} />;
};

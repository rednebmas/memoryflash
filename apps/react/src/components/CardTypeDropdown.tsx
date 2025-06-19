import React from 'react';
import Dropdown from './Dropdown';

export interface CardTypeDropdownProps {
	value: 'Sheet Music' | 'Text Prompt';
	onChange: (val: 'Sheet Music' | 'Text Prompt') => void;
}

export const CardTypeDropdown: React.FC<CardTypeDropdownProps> = ({ value, onChange }) => {
	const items = [
		{ label: 'Sheet Music', onClick: () => onChange('Sheet Music') },
		{ label: 'Text Prompt', onClick: () => onChange('Text Prompt') },
	];
	return <Dropdown label={value} items={items} />;
};

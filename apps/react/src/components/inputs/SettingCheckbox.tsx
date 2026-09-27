import React from 'react';
import { Checkbox } from './Checkbox';

interface SettingCheckboxProps {
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}

export const SettingCheckbox: React.FC<SettingCheckboxProps> = ({ label, checked, onChange }) => (
	<label className="flex items-center gap-2 text-sm">
		<Checkbox checked={checked} onChange={(e) => onChange(e.target.checked)} />
		{label}
	</label>
);

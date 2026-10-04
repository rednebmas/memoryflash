import React from 'react';
import { Checkbox } from './Checkbox';

interface SettingCheckboxProps {
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
	disabled?: boolean;
}

export const SettingCheckbox: React.FC<SettingCheckboxProps> = ({
	label,
	checked,
	onChange,
	disabled,
}) => (
	<label className="flex items-center gap-2 text-sm">
		<Checkbox
			checked={checked}
			disabled={disabled}
			onChange={(e) => onChange(e.target.checked)}
		/>
		{label}
	</label>
);

import React from 'react';
import { toggleInOrder } from 'MemoryFlashCore/src/lib/toggleInOrder';
import { SettingCheckbox } from './SettingCheckbox';

interface CheckboxGroupProps<T extends string | number> {
	title: string;
	options: readonly T[];
	value: T[];
	onChange: (value: T[]) => void;
	label?: (option: T) => string;
}

export const CheckboxGroup = <T extends string | number>({
	title,
	options,
	value,
	onChange,
	label = String,
}: CheckboxGroupProps<T>) => (
	<div className="space-y-1">
		<p className="text-sm font-medium">{title}</p>
		<div className="flex flex-wrap gap-4">
			{options.map((option) => (
				<SettingCheckbox
					key={option}
					label={label(option)}
					checked={value.includes(option)}
					onChange={() => onChange(toggleInOrder(options, value, option))}
				/>
			))}
		</div>
	</div>
);

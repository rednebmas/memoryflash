import React from 'react';
import { Select } from './Select';

export const secondsOptions = (options: number[]) =>
	options.map((ms) => ({ value: ms, label: `${ms / 1000}s` }));

interface InlineSelectProps<T extends string | number> {
	label: string;
	value: T;
	options: { value: T; label: string }[];
	onChange: (value: T) => void;
}

export const InlineSelect = <T extends string | number>({
	label,
	value,
	options,
	onChange,
}: InlineSelectProps<T>) => (
	<label className="flex items-center gap-2 text-sm text-muted whitespace-nowrap">
		{label}
		<Select
			className="!py-1"
			value={value}
			onChange={(e) => onChange(options[e.target.selectedIndex].value)}
		>
			{options.map((option) => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</Select>
	</label>
);

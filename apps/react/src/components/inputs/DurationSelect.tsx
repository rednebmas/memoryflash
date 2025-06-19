import React from 'react';
import { NoteDuration } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { Select, SelectProps } from './Select';

export interface DurationSelectProps extends Omit<SelectProps, 'children'> {
	value: NoteDuration;
	onChange: React.ChangeEventHandler<HTMLSelectElement>;
}

export const DurationSelect = React.forwardRef<HTMLSelectElement, DurationSelectProps>(
	({ className = '', value, onChange, ...props }, ref) => (
		<Select ref={ref} className={className} value={value} onChange={onChange} {...props}>
			{['w', 'h', 'q', '8', '16'].map((d) => (
				<option key={d} value={d}>
					{d}
				</option>
			))}
		</Select>
	),
);
DurationSelect.displayName = 'DurationSelect';

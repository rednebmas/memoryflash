import React from 'react';
import { Select } from './Select';
import { NoteDuration } from 'MemoryFlashCore/src/types/MultiSheetCard';

export interface DurationSelectProps {
	label: string;
	value: NoteDuration;
	onChange: (d: NoteDuration) => void;
	className?: string;
}

export const DurationSelect: React.FC<DurationSelectProps> = ({
	label,
	value,
	onChange,
	className = '',
}) => (
	<label className={`flex items-center gap-2 ${className}`}>
		{label}
		<Select value={value} onChange={(e) => onChange(e.target.value as NoteDuration)}>
			{['w', 'h', 'q', '8', '16'].map((d) => (
				<option key={d} value={d}>
					{d}
				</option>
			))}
		</Select>
	</label>
);

DurationSelect.displayName = 'DurationSelect';

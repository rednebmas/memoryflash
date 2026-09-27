import React from 'react';
import { SettingCheckbox } from '../inputs/SettingCheckbox';

const SEGMENT_SIZES = [1, 2, 4, 8];

interface SegmentSettingsProps {
	segmentBars: number[];
	onChange: (segmentBars: number[]) => void;
}

export const SegmentSettings: React.FC<SegmentSettingsProps> = ({ segmentBars, onChange }) => {
	const toggle = (size: number, on: boolean) =>
		onChange(
			on
				? [...segmentBars, size].sort((a, b) => a - b)
				: segmentBars.filter((s) => s !== size),
		);

	return (
		<div className="space-y-1">
			<p className="text-sm font-medium">Split into segment cards</p>
			<div className="flex flex-wrap gap-4">
				{SEGMENT_SIZES.map((size) => (
					<SettingCheckbox
						key={size}
						label={`${size} bar${size > 1 ? 's' : ''}`}
						checked={segmentBars.includes(size)}
						onChange={(on) => toggle(size, on)}
					/>
				))}
			</div>
		</div>
	);
};

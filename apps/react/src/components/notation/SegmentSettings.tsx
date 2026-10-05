import React from 'react';
import { CheckboxGroup } from '../inputs/CheckboxGroup';

const SEGMENT_SIZES = [1, 2, 4, 8];

interface SegmentSettingsProps {
	segmentBars: number[];
	onChange: (segmentBars: number[]) => void;
}

export const SegmentSettings: React.FC<SegmentSettingsProps> = ({ segmentBars, onChange }) => (
	<CheckboxGroup
		title="Split into segment cards"
		options={SEGMENT_SIZES}
		value={segmentBars}
		onChange={onChange}
		label={(size) => `${size} bar${size > 1 ? 's' : ''}`}
	/>
);

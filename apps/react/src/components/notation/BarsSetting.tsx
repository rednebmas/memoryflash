import React from 'react';
import { NumberInput } from '../inputs';
import { SettingsSection } from './SettingsSection';

interface BarsSettingProps {
	bars: number;
	setBars: (n: number) => void;
}

export const BarsSetting: React.FC<BarsSettingProps> = ({ bars, setBars }) => (
	<SettingsSection title="Bars">
		<label className="flex items-center gap-2">
			Count
			<NumberInput
				className="w-16"
				min={1}
				value={bars}
				onChange={(e) => setBars(parseInt(e.target.value, 10) || 1)}
			/>
		</label>
	</SettingsSection>
);

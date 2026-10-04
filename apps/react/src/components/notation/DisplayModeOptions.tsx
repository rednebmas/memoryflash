import React from 'react';
import { SHEET_DISPLAY_MODES, SheetDisplayMode } from 'MemoryFlashCore/src/types/PresentationMode';
import { SettingCheckbox } from '../inputs/SettingCheckbox';

interface DisplayModeOptionsProps {
	value: SheetDisplayMode[];
	onChange: (displayModes: SheetDisplayMode[]) => void;
}

export const DisplayModeOptions: React.FC<DisplayModeOptionsProps> = ({ value, onChange }) => {
	const toggle = (mode: SheetDisplayMode, on: boolean) =>
		onChange(SHEET_DISPLAY_MODES.filter((m) => (m === mode ? on : value.includes(m))));
	return (
		<div className="flex flex-col gap-1">
			<span className="text-sm text-muted">Study it as</span>
			<div className="flex gap-4">
				{SHEET_DISPLAY_MODES.map((mode) => (
					<SettingCheckbox
						key={mode}
						label={mode}
						checked={value.includes(mode)}
						disabled={value.length === 1 && value[0] === mode}
						onChange={(on) => toggle(mode, on)}
					/>
				))}
			</div>
		</div>
	);
};

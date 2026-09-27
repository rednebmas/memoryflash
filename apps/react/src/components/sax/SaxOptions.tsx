import React from 'react';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { settingsActions } from 'MemoryFlashCore/src/redux/slices/settingsSlice';
import { saveSetting } from 'MemoryFlashCore/src/redux/actions/save-setting-action';
import { saxAnyOctaveSelector } from 'MemoryFlashCore/src/redux/selectors/instrumentSelector';
import { SettingCheckbox } from '../inputs/SettingCheckbox';
import { SaxFingeringsToggle } from './SaxFingerings';
import { SaxToneSettings } from './SaxToneSettings';

export const SaxOptions: React.FC = () => {
	const dispatch = useAppDispatch();
	const anyOctave = useAppSelector(saxAnyOctaveSelector);
	return (
		<div className="flex flex-col items-start gap-2">
			<SaxFingeringsToggle />
			<SaxToneSettings />
			<SettingCheckbox
				label="Accept any octave"
				checked={anyOctave}
				onChange={(on) => dispatch(saveSetting(settingsActions.setSaxAnyOctave(on)))}
			/>
		</div>
	);
};

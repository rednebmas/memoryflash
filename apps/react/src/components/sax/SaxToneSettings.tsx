import React from 'react';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { settingsActions } from 'MemoryFlashCore/src/redux/slices/settingsSlice';
import { saveSetting } from 'MemoryFlashCore/src/redux/actions/save-setting-action';
import {
	saxToneModeSelector,
	saxToneMsSelector,
} from 'MemoryFlashCore/src/redux/selectors/instrumentSelector';
import {
	TONE_LENGTH_OPTIONS_MS,
	TONE_MODES,
	TONE_MODE_LABELS,
} from 'MemoryFlashCore/src/lib/saxTone';
import { InlineSelect, secondsOptions } from '../inputs/InlineSelect';

export const SaxToneSettings: React.FC = () => {
	const dispatch = useAppDispatch();
	const mode = useAppSelector(saxToneModeSelector);
	const toneMs = useAppSelector(saxToneMsSelector);
	return (
		<div className="flex flex-wrap items-center gap-3">
			<InlineSelect
				label="Play the note"
				value={mode}
				options={TONE_MODES.map((m) => ({ value: m, label: TONE_MODE_LABELS[m] }))}
				onChange={(m) => dispatch(saveSetting(settingsActions.setSaxToneMode(m)))}
			/>
			{mode !== 'off' && (
				<InlineSelect
					label="for"
					value={toneMs}
					options={secondsOptions(TONE_LENGTH_OPTIONS_MS)}
					onChange={(ms) => dispatch(saveSetting(settingsActions.setSaxToneMs(ms)))}
				/>
			)}
		</div>
	);
};

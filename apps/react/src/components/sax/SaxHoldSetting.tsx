import React from 'react';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { settingsActions } from 'MemoryFlashCore/src/redux/slices/settingsSlice';
import { saveSetting } from 'MemoryFlashCore/src/redux/actions/save-setting-action';
import { saxHoldMsSelector } from 'MemoryFlashCore/src/redux/selectors/instrumentSelector';
import { SAX_HOLD_OPTIONS_MS } from 'MemoryFlashCore/src/lib/saxPitch';
import { InlineSelect, secondsOptions } from '../inputs/InlineSelect';

export const SaxHoldSetting: React.FC = () => {
	const dispatch = useAppDispatch();
	return (
		<InlineSelect
			label="Hold note for"
			value={useAppSelector(saxHoldMsSelector)}
			options={secondsOptions(SAX_HOLD_OPTIONS_MS)}
			onChange={(ms) => dispatch(saveSetting(settingsActions.setSaxHoldMs(ms)))}
		/>
	);
};

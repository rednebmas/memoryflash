import React from 'react';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { settingsActions } from 'MemoryFlashCore/src/redux/slices/settingsSlice';
import { saveSetting } from 'MemoryFlashCore/src/redux/actions/save-setting-action';
import { saxHoldMsSelector } from 'MemoryFlashCore/src/redux/selectors/instrumentSelector';
import { SAX_HOLD_OPTIONS_MS } from 'MemoryFlashCore/src/lib/saxPitch';
import { Select } from '../inputs/Select';

export const SaxHoldSetting: React.FC = () => {
	const dispatch = useAppDispatch();
	const holdMs = useAppSelector(saxHoldMsSelector);
	return (
		<label className="flex items-center gap-2 text-sm text-muted whitespace-nowrap">
			Hold note for
			<Select
				className="w-24 !py-1"
				value={holdMs}
				onChange={(e) =>
					dispatch(saveSetting(settingsActions.setSaxHoldMs(Number(e.target.value))))
				}
			>
				{SAX_HOLD_OPTIONS_MS.map((ms) => (
					<option key={ms} value={ms}>
						{ms / 1000}s
					</option>
				))}
			</Select>
		</label>
	);
};

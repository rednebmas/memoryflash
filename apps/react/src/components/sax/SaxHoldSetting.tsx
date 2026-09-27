import React from 'react';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { settingsActions } from 'MemoryFlashCore/src/redux/slices/settingsSlice';
import {
	currentSheetCardSelector,
	saxHoldMsSelector,
} from 'MemoryFlashCore/src/redux/selectors/instrumentSelector';
import { SAX_HOLD_OPTIONS_MS } from 'MemoryFlashCore/src/lib/saxPitch';
import { Select } from '../inputs/Select';

export const SaxHoldSetting: React.FC = () => {
	const dispatch = useAppDispatch();
	const card = useAppSelector(currentSheetCardSelector);
	const holdMs = useAppSelector(saxHoldMsSelector);
	if (!card) return null;
	return (
		<div className="space-y-2">
			<p className="text-sm font-medium">Saxophone hold time</p>
			<Select
				className="w-36"
				value={holdMs}
				onChange={(e) => dispatch(settingsActions.setSaxHoldMs(Number(e.target.value)))}
			>
				{SAX_HOLD_OPTIONS_MS.map((ms) => (
					<option key={ms} value={ms}>
						{ms / 1000} seconds
					</option>
				))}
			</Select>
			<p className="caption">How long to hold a note before it counts as your answer.</p>
		</div>
	);
};

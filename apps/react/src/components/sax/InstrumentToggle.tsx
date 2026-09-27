import React from 'react';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { Instrument, settingsActions } from 'MemoryFlashCore/src/redux/slices/settingsSlice';
import {
	currentSheetCardSelector,
	instrumentSelector,
} from 'MemoryFlashCore/src/redux/selectors/instrumentSelector';
import { SegmentedPicker } from '../ui/SegmentedPicker';

const INSTRUMENTS: { value: Instrument; text: string }[] = [
	{ value: 'piano', text: 'Piano' },
	{ value: 'sax', text: 'Saxophone' },
];

export const InstrumentToggle: React.FC = () => {
	const dispatch = useAppDispatch();
	const instrument = useAppSelector(instrumentSelector);
	const card = useAppSelector(currentSheetCardSelector);
	if (!card) return null;
	return (
		<SegmentedPicker
			options={INSTRUMENTS}
			value={instrument}
			onChange={(value) => dispatch(settingsActions.setInstrument(value))}
		/>
	);
};

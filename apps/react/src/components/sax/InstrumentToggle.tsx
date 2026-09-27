import React from 'react';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { Instrument, settingsActions } from 'MemoryFlashCore/src/redux/slices/settingsSlice';
import { saveSetting } from 'MemoryFlashCore/src/redux/actions/save-setting-action';
import {
	currentNoteNameSelector,
	currentSheetCardSelector,
	instrumentSelector,
} from 'MemoryFlashCore/src/redux/selectors/instrumentSelector';
import { SegmentedPicker } from '../ui/SegmentedPicker';

const INSTRUMENTS: { value: Instrument; text: string }[] = [
	{ value: 'piano', text: 'Piano' },
	{ value: 'sax', text: 'Saxophone' },
	{ value: 'names', text: 'Note names' },
];

export const InstrumentToggle: React.FC = () => {
	const dispatch = useAppDispatch();
	const instrument = useAppSelector(instrumentSelector);
	const card = useAppSelector(currentSheetCardSelector);
	const noteName = useAppSelector(currentNoteNameSelector);
	if (!card) return null;
	return (
		<SegmentedPicker
			options={noteName ? INSTRUMENTS : INSTRUMENTS.filter((i) => i.value !== 'names')}
			value={instrument}
			onChange={(value) => dispatch(saveSetting(settingsActions.setInstrument(value)))}
		/>
	);
};

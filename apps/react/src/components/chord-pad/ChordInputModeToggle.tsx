import React from 'react';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { ChordInputMode, settingsActions } from 'MemoryFlashCore/src/redux/slices/settingsSlice';
import {
	chordInputModeSelector,
	currentCardAcceptsChordNamesSelector,
} from 'MemoryFlashCore/src/redux/selectors/chordInputModeSelector';
import { SegmentedPicker } from '../ui/SegmentedPicker';

const MODES: { value: ChordInputMode; text: string }[] = [
	{ value: 'piano', text: 'Piano' },
	{ value: 'names', text: 'Chord names' },
];

export const ChordInputModeToggle: React.FC = () => {
	const dispatch = useAppDispatch();
	const mode = useAppSelector(chordInputModeSelector);
	const show = useAppSelector(currentCardAcceptsChordNamesSelector);
	if (!show) return null;
	return (
		<SegmentedPicker
			options={MODES}
			value={mode}
			onChange={(value) => dispatch(settingsActions.setChordInputMode(value))}
		/>
	);
};

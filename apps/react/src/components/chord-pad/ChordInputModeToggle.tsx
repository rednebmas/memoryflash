import React from 'react';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { ChordInputMode, settingsActions } from 'MemoryFlashCore/src/redux/slices/settingsSlice';
import {
	chordInputModeSelector,
	currentCardAcceptsChordNamesSelector,
} from 'MemoryFlashCore/src/redux/selectors/chordInputModeSelector';
import { SegmentedControl } from '../ui/SegmentedControl';
import { SegmentButton } from '../ui/SegmentButton';

const MODES: { mode: ChordInputMode; text: string }[] = [
	{ mode: 'piano', text: 'Piano' },
	{ mode: 'names', text: 'Chord names' },
];

export const ChordInputModeToggle: React.FC = () => {
	const dispatch = useAppDispatch();
	const mode = useAppSelector(chordInputModeSelector);
	const show = useAppSelector(currentCardAcceptsChordNamesSelector);
	if (!show) return null;
	return (
		<SegmentedControl variant="compact">
			{MODES.map((m) => (
				<SegmentButton
					key={m.mode}
					variant="compact"
					text={m.text}
					active={mode === m.mode}
					onClick={() => dispatch(settingsActions.setChordInputMode(m.mode))}
				/>
			))}
		</SegmentedControl>
	);
};

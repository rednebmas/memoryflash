import React, { useEffect } from 'react';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { noteNamePadKeysSelector } from 'MemoryFlashCore/src/redux/selectors/noteNamePadSelector';
import { tapNoteName } from 'MemoryFlashCore/src/redux/actions/tap-note-name-action';
import { midiActions } from 'MemoryFlashCore/src/redux/slices/midiSlice';
import { PadKey } from './PadKey';

const SHARP_COLUMNS: Record<number, string> = {
	1: 'col-start-2',
	3: 'col-start-4',
	6: 'col-start-8',
	8: 'col-start-10',
	10: 'col-start-12',
};

const SHOW_CORRECT_MS = 400;

const useClearAfterCorrect = () => {
	const dispatch = useAppDispatch();
	const pendingClear = useAppSelector((s) => s.midi.pendingClearClickedNotes);
	useEffect(() => {
		if (!pendingClear) return;
		const timer = setTimeout(() => dispatch(midiActions.clearClickedNotes()), SHOW_CORRECT_MS);
		return () => clearTimeout(timer);
	}, [pendingClear]);
};

export const ChordSpellingPad: React.FC = () => {
	const dispatch = useAppDispatch();
	const keys = useAppSelector(noteNamePadKeysSelector);
	useClearAfterCorrect();
	const row = (rowKeys: typeof keys) => (
		<div className="grid grid-cols-[repeat(14,minmax(0,1fr))] gap-1.5">
			{rowKeys.map((k) => (
				<PadKey
					key={k.label}
					label={k.label}
					lines={k.names}
					active={k.held}
					wrong={k.wrong}
					className={clsx('col-span-2', SHARP_COLUMNS[k.pitchClass])}
					onPress={() => dispatch(tapNoteName(k.pitchClass))}
				/>
			))}
		</div>
	);
	return (
		<div className="flex flex-col gap-1.5 px-4 pt-3 pb-4 max-w-xl mx-auto w-full">
			{row(keys.filter((k) => k.names.length > 1))}
			{row(keys.filter((k) => k.names.length === 1))}
		</div>
	);
};

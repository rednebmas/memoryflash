import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { midiActions } from 'MemoryFlashCore/src/redux/slices/midiSlice';
import { settingsActions } from 'MemoryFlashCore/src/redux/slices/settingsSlice';
import { saveSetting } from 'MemoryFlashCore/src/redux/actions/save-setting-action';
import { midiActionKeyRowsSelector } from 'MemoryFlashCore/src/redux/selectors/midiActionKeysSelector';
import { Button } from './ui/Button';

export const MidiShortcutsSettings: React.FC = () => {
	const dispatch = useAppDispatch();
	const rows = useAppSelector(midiActionKeyRowsSelector);
	useEffect(() => () => void dispatch(midiActions.learnActionKey(undefined)), []);

	return (
		<div className="space-y-2">
			<p className="text-sm font-medium">MIDI shortcuts</p>
			{rows.map(({ action, label, keyName, learning }) => (
				<div key={action} className="flex items-center gap-2 text-sm text-muted">
					<span className="w-44">{label}</span>
					<Button
						variant="secondary"
						className="!py-1"
						onClick={() =>
							dispatch(midiActions.learnActionKey(learning ? undefined : action))
						}
					>
						{learning ? 'Press a key…' : (keyName ?? 'Set key')}
					</Button>
					{keyName && !learning && (
						<Button
							variant="outline"
							className="!py-1"
							onClick={() =>
								dispatch(
									saveSetting(
										settingsActions.setMidiActionKey({ action, note: null }),
									),
								)
							}
						>
							Clear
						</Button>
					)}
				</div>
			))}
			<p className="caption">Shortcut keys trigger their action and are never graded.</p>
		</div>
	);
};

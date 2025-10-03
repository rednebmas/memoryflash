import React from 'react';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import Dropdown from './Dropdown';
import { midiActions } from 'MemoryFlashCore/src/redux/slices/midiSlice';

interface MidiInputsDropdownProps {}

export const MidiInputsDropdown: React.FunctionComponent<MidiInputsDropdownProps> = ({}) => {
	const dispatch = useAppDispatch();
	const devices = useAppSelector((state) => state.midi.availableMidiDevices);
	const inputs = devices.filter((device) => device.type === 'input');
	const selectedInputId = useAppSelector((state) => state.midi.selectedInput);
	const selectedInputName = devices.find((input) => input.id === selectedInputId)?.name;
	const pianoSamplesEnabled = useAppSelector((state) => state.midi.pianoSamplesEnabled);

	return (
		<div className="flex flex-row gap-4">
			<button
				onClick={() => dispatch(midiActions.setPianoSamplesEnabled(!pianoSamplesEnabled))}
				className={`px-3 py-1 rounded text-sm ${
					pianoSamplesEnabled
						? 'bg-blue-500 text-white'
						: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
				}`}
				title="Toggle piano samples"
			>
				🎹
			</button>
			<Dropdown
				label={selectedInputName || 'No MIDI Input'}
				onButtonClick={(e) => {
					// Open settings on iOS app
					e?.preventDefault();
					(window as any).webkit?.messageHandlers?.openSettings?.postMessage('');
				}}
				items={inputs.map((device) => ({
					label: device.name,
					onClick: () => {
						dispatch(midiActions.setSelectedInput(device.id));
					},
				}))}
			/>
		</div>
	);
};

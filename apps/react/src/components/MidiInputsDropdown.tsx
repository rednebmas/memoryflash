import React from 'react';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import Dropdown from './Dropdown';
import { midiActions } from 'MemoryFlashCore/src/redux/slices/midiSlice';

interface MidiInputsDropdownProps {}

export const MidiInputsDropdown: React.FunctionComponent<MidiInputsDropdownProps> = ({}) => {
	const dispatch = useAppDispatch();
	const devices = useAppSelector((state) => state.midi.availableMidiDevices);
	const inputs = devices.filter((device) => device.type === 'input');
	// const outputs = devices.filter((device) => device.type === 'output');
	const selectedInputId = useAppSelector((state) => state.midi.selectedInput);
	const selectedInputName = devices.find((input) => input.id === selectedInputId)?.name;
	// const selectedOutputId = useAppSelector((state) => state.midi.selectedOutput);
	// const selectedOutputName = devices.find((input) => input.id === selectedOutputId)?.name;

	return (
		<div className='flex flex-row gap-4'>
			{/* <Dropdown
				label={selectedOutputName || 'No MIDI Output'}
				items={outputs.map((device) => ({
					label: device.name,
					onClick: () => {
						dispatch(midiActions.setSelectedOutput(device.id));
					},
				}))}
			/> */}
			<Dropdown
				label={selectedInputName || 'No MIDI Input'}
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

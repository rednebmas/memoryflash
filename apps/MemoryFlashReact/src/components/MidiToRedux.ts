import React, { useEffect } from 'react';
import { WebMidi } from 'webmidi';
import { midiActions } from '../submodules/MemoryFlashCore/src/redux/slices/midiSlice';
import { useAppDispatch, useAppSelector } from '../submodules/MemoryFlashCore/src/redux/store';
import usePrevious from '../utils/usePrevious';
import { Midi } from 'tonal';

interface MidiToReduxProps {}

export const MidiToRedux: React.FunctionComponent<MidiToReduxProps> = ({}) => {
	const dispatch = useAppDispatch();

	const selectedInputId = useAppSelector((state) => state.midi.selectedInput);
	const previousSelectedInputId = usePrevious(selectedInputId);

	// const selectedOutputId = useAppSelector((state) => state.midi.selectedOutput);

	useEffect(() => {
		WebMidi.enable()
			.then(onEnabled)
			.catch((err) => alert(err));

		function onEnabled() {
			console.log('WebMidi enabled');

			dispatch(midiActions.clearDevices());
			let setInputDevice = false;
			[...WebMidi.inputs, ...WebMidi.outputs].forEach((device, i) => {
				// console.log('Input:', device.name, device.id, device);

				dispatch(
					midiActions.addDevice({
						id: device.id,
						name: device.name,
						type: device.type === 'input' ? 'input' : 'output',
					}),
				);
				if (!setInputDevice && device.type == 'input') {
					setInputDevice = true;
					dispatch(midiActions.setSelectedInput(device.id));
				}
			});

			// Then, find the first input & output devices and set it as selected
			if (WebMidi.inputs[0]) {
				dispatch(midiActions.setSelectedInput(WebMidi.inputs[0].id));
			}
			if (WebMidi.outputs[0]) {
				dispatch(midiActions.setSelectedOutput(WebMidi.outputs[0].id));
			}

			// connected listener
			WebMidi.addListener('connected', (e) => {
				// console.log('Midi Input Connected:', e.port.id, e.port.name);

				dispatch(
					midiActions.addDevice({
						id: e.port.id,
						name: e.port.name,
						type: e.port.type,
					}),
				);
			});

			WebMidi.addListener('disconnected', (e) => {
				console.log('Midi Input Disconnected:', e.port.id, e.port.name);
				dispatch(midiActions.removeDevice(e.port.id));
			});
		}
	}, []);

	useEffect(() => {
		if (selectedInputId === previousSelectedInputId) return;
		if (previousSelectedInputId) {
			WebMidi.getInputById(previousSelectedInputId)?.removeListener('noteon');
			WebMidi.getInputById(previousSelectedInputId)?.removeListener('noteoff');
		}
		if (selectedInputId) {
			WebMidi.getInputById(selectedInputId)?.addListener('noteon', (e) => {
				const note = Midi.midiToNoteName(e.note.number);
				console.log('Note On:', e.note.number, note);
				dispatch(midiActions.addNote(e.note.number));
				if (e.note.number === 24) {
					window.location.reload();
				}
			});
			WebMidi.getInputById(selectedInputId)?.addListener('noteoff', (e) => {
				console.log('Note Off:', e.note.number, e.note.name, e.note.octave);
				dispatch(midiActions.removeNote(e.note.number));
			});
		}
	}, [selectedInputId]);

	// useEffect(() => {
	// 	if (selectedOutputId) {
	// 		WebMidi.getOutputById(selectedOutputId)?.playNote('C4', { duration: 1000 });
	// 		console.log(`Playing C4 ${selectedOutputId}`, WebMidi.getOutputById(selectedOutputId));
	// 	}
	// }, [selectedOutputId]);

	return null;
};

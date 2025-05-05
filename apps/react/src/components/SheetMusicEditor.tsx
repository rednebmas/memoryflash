import React, { useState, useEffect, useRef } from 'react';
import { MusicNotation } from './MusicNotation';
import { Button } from './Button';
import NumberAdjuster from './NumberAdjuster';
import Dropdown from './Dropdown';
import { MultiSheetQuestion, StackedNotes } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { MusicRecorder } from '../utils/MusicRecorder';
import { transposeToAllKeys, TRANSPOSITION_KEYS } from '../utils/transposeUtils';

// Note duration options with labels
const NOTE_DURATIONS = [
	{ value: 'w', label: 'Whole Note (𝅝)' },
	{ value: 'h', label: 'Half Note (𝅗𝅥)' },
	{ value: 'q', label: 'Quarter Note (𝅘𝅥)' },
	{ value: '8', label: 'Eighth Note (𝅘𝅥𝅮)' },
	{ value: '16', label: 'Sixteenth Note (𝅘𝅥𝅯)' },
];

interface SheetMusicEditorProps {
	keySignature: string;
	middleNote: number;
	midiNotes: { number: number; clicked?: boolean }[];
	
	// Optional props for controlling state externally
	showAllKeys?: boolean;
	setShowAllKeys?: (show: boolean) => void;
	noteDuration?: string;
	setNoteDuration?: (duration: 'w' | 'h' | 'q' | '8' | '16') => void;
	measureCount?: number;
	setMeasureCount?: (count: number) => void;
	
	// Callback for when music changes
	onMusicChange?: (recorded: MultiSheetQuestion, transposed: MultiSheetQuestion[]) => void;
}

const SheetMusicEditor: React.FC<SheetMusicEditorProps> = ({
	keySignature,
	middleNote,
	midiNotes,
	showAllKeys: externalShowAllKeys,
	setShowAllKeys: externalSetShowAllKeys,
	noteDuration: externalNoteDuration,
	setNoteDuration: externalSetNoteDuration,
	measureCount: externalMeasureCount,
	setMeasureCount: externalSetMeasureCount,
	onMusicChange,
}) => {
	// State for editor settings - use external state if provided, otherwise use local state
	const [internalNoteDuration, setInternalNoteDuration] = useState<'w' | 'h' | 'q' | '8' | '16'>('h');
	const [internalMeasureCount, setInternalMeasureCount] = useState<number>(1);
	const [internalShowAllKeys, setInternalShowAllKeys] = useState<boolean>(false);
	
	// Use either external or internal state
	const noteDuration = externalNoteDuration as 'w' | 'h' | 'q' | '8' | '16' || internalNoteDuration;
	const measureCount = externalMeasureCount || internalMeasureCount;
	const showAllKeys = externalShowAllKeys !== undefined ? externalShowAllKeys : internalShowAllKeys;
	
	// Functions to update state that consider external state handlers
	const updateNoteDuration = (value: 'w' | 'h' | 'q' | '8' | '16') => {
		if (externalSetNoteDuration) {
			externalSetNoteDuration(value);
		} else {
			setInternalNoteDuration(value);
		}
	};
	
	const updateMeasureCount = (value: number) => {
		if (externalSetMeasureCount) {
			externalSetMeasureCount(value);
		} else {
			setInternalMeasureCount(value);
		}
	};
	
	const updateShowAllKeys = (value: boolean) => {
		if (externalSetShowAllKeys) {
			externalSetShowAllKeys(value);
		} else {
			setInternalShowAllKeys(value);
		}
	};

	// Create and maintain recorder instance
	const recorderRef = useRef(
		new MusicRecorder(keySignature, middleNote, measureCount, noteDuration),
	);
	const [recordingState, setRecordingState] = useState(recorderRef.current.getState());
	const [recordedMusic, setRecordedMusic] = useState<MultiSheetQuestion>(
		recorderRef.current.toMultiSheetQuestion(),
	);
	const [transposedMusic, setTransposedMusic] = useState<MultiSheetQuestion[]>([]);

	// Update recorder when settings change
	useEffect(() => {
		recorderRef.current.updateSettings({
			key: keySignature,
			middleNote,
			measuresCount: measureCount,
			noteDuration,
		});
		setRecordingState(recorderRef.current.getState());
		const music = recorderRef.current.toMultiSheetQuestion();
		setRecordedMusic(music);

		// Update transposed versions when original changes
		if (showAllKeys && music.voices.length > 0) {
			setTransposedMusic(transposeToAllKeys(music, keySignature));
		}
		
		// Notify parent component of music changes
		if (onMusicChange) {
			onMusicChange(music, showAllKeys ? transposeToAllKeys(music, keySignature) : []);
		}
	}, [keySignature, middleNote, measureCount, noteDuration, showAllKeys, onMusicChange]);

	// Record notes when MIDI notes change
	useEffect(() => {
		if (midiNotes.length > 0 && !recordingState.isComplete) {
			if (recorderRef.current.recordNotes(midiNotes)) {
				const newState = recorderRef.current.getState();
				setRecordingState(newState);
				const music = recorderRef.current.toMultiSheetQuestion();
				setRecordedMusic(music);

				// Update transposed versions when original changes
				if (showAllKeys && music.voices.length > 0) {
					const transposed = transposeToAllKeys(music, keySignature);
					setTransposedMusic(transposed);
					
					// Notify parent component of music changes
					if (onMusicChange) {
						onMusicChange(music, transposed);
					}
				} else if (onMusicChange) {
					onMusicChange(music, []);
				}
			}
		}
	}, [midiNotes, showAllKeys, keySignature, onMusicChange]);

	// Reset the recording
	const handleReset = () => {
		recorderRef.current.reset();
		setRecordingState(recorderRef.current.getState());
		const music = recorderRef.current.toMultiSheetQuestion();
		setRecordedMusic(music);
		setTransposedMusic([]);
		
		// Notify parent component of music changes
		if (onMusicChange) {
			onMusicChange(music, []);
		}
	};

	// Toggle showing all keys
	const handleToggleAllKeys = () => {
		const newValue = !showAllKeys;
		updateShowAllKeys(newValue);

		if (newValue && recordedMusic.voices.length > 0) {
			const transposed = transposeToAllKeys(recordedMusic, keySignature);
			setTransposedMusic(transposed);
			
			// Notify parent component
			if (onMusicChange) {
				onMusicChange(recordedMusic, transposed);
			}
		} else if (onMusicChange) {
			onMusicChange(recordedMusic, []);
		}
	};

	// Get the current duration display name
	const currentDuration =
		NOTE_DURATIONS.find((d) => d.value === noteDuration) || NOTE_DURATIONS[1];

	// Create dropdown items for duration selection
	const durationItems = React.useMemo(
		() =>
			NOTE_DURATIONS.map((duration) => ({
				label: duration.label,
				onClick: () => updateNoteDuration(duration.value as 'w' | 'h' | 'q' | '8' | '16'),
			})),
		[updateNoteDuration],
	);

	// Calculate progress percentage
	const progressPercentage =
		recordingState.totalPositions > 0
			? (recordingState.currentPosition / recordingState.totalPositions) * 100
			: 0;

	return (
		<div className='space-y-6'>
			<h3 className='text-lg font-medium'>Music Notation</h3>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				<div>
					<label className='block mb-2'>Note Duration</label>
					<Dropdown label={currentDuration.label} items={durationItems} />
				</div>

				<div>
					<NumberAdjuster
						label='Number of Measures'
						value={measureCount}
						onValueChange={updateMeasureCount}
						min={1}
						max={8}
						allowManualInput={false}
					/>
				</div>
			</div>

			<div>
				<div className='flex justify-between mb-1 text-sm'>
					<span>Recording Progress:</span>
					<span>
						Position {recordingState.currentPosition} of {recordingState.totalPositions}
						{recordingState.isComplete ? ' (Complete)' : ''}
					</span>
				</div>
				<div className='w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700'>
					<div
						className='bg-blue-600 h-2.5 rounded-full'
						style={{ width: `${progressPercentage}%` }}
					></div>
				</div>
			</div>

			<div className='flex justify-between'>
				<div>
					<label className='flex items-center'>
						<input
							type='checkbox'
							className='mr-2'
							checked={showAllKeys}
							onChange={handleToggleAllKeys}
						/>
						Show in all 12 keys
					</label>
				</div>
				<Button variant='outline' onClick={handleReset}>
					Reset Recording
				</Button>
			</div>

			{!showAllKeys ? (
				// Show only current key
				<div className='p-4 border rounded'>
					{recordedMusic.voices.length > 0 ? (
						<MusicNotation data={recordedMusic} />
					) : (
						<div className='flex justify-center items-center h-40 text-gray-500'>
							Play notes on your MIDI device to record music
						</div>
					)}
				</div>
			) : (
				// Show all 12 keys
				<div>
					<h4 className='text-md font-medium mb-2'>Original Key ({keySignature})</h4>
					<div className='p-4 border rounded mb-4'>
						{recordedMusic.voices.length > 0 ? (
							<MusicNotation data={recordedMusic} />
						) : (
							<div className='flex justify-center items-center h-40 text-gray-500'>
								Play notes on your MIDI device to record music
							</div>
						)}
					</div>

					{transposedMusic.length > 0 && (
						<div className='space-y-4'>
							<h4 className='text-md font-medium'>Transposed Keys</h4>
							{transposedMusic.map((music, index) => (
								<div key={music.key} className='p-4 border rounded'>
									<h5 className='text-sm font-medium mb-2'>Key of {music.key}</h5>
									<MusicNotation data={music} />
								</div>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default SheetMusicEditor;

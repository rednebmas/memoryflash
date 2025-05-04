import React, { useState, useEffect, useRef } from 'react';
import { MusicNotation } from './MusicNotation';
import { Button } from './Button';
import NumberAdjuster from './NumberAdjuster';
import Dropdown from './Dropdown';
import { MultiSheetQuestion } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { MusicRecorder } from '../utils/MusicRecorder';
import { transposeToAllKeys, TRANSPOSITION_KEYS } from '../utils/transposeUtils';

// Note duration options with labels
const NOTE_DURATIONS = [
  { value: 'w', label: 'Whole Note (𝅝)' },
  { value: 'h', label: 'Half Note (𝅗𝅥)' },
  { value: 'q', label: 'Quarter Note (𝅘𝅥)' },
  { value: '8', label: 'Eighth Note (𝅘𝅥𝅮)' },
  { value: '16', label: 'Sixteenth Note (𝅘𝅥𝅯)' }
];

interface SheetMusicEditorProps {
  keySignature: string;
  middleNote: number;
  midiNotes: { number: number; clicked?: boolean }[];
}

const SheetMusicEditor: React.FC<SheetMusicEditorProps> = ({
  keySignature,
  middleNote,
  midiNotes
}) => {
  // State for editor settings
  const [noteDuration, setNoteDuration] = useState<string>('h'); // Default: half note
  const [measureCount, setMeasureCount] = useState<number>(1); // Default: 1 measure
  const [showAllKeys, setShowAllKeys] = useState<boolean>(false);
  
  // Create and maintain recorder instance
  const recorderRef = useRef(new MusicRecorder(keySignature, middleNote, measureCount, noteDuration));
  const [recordingState, setRecordingState] = useState(recorderRef.current.getState());
  const [recordedMusic, setRecordedMusic] = useState<MultiSheetQuestion>(
    recorderRef.current.toMultiSheetQuestion()
  );
  const [transposedMusic, setTransposedMusic] = useState<MultiSheetQuestion[]>([]);

  // Update recorder when settings change
  useEffect(() => {
    recorderRef.current.updateSettings({
      key: keySignature,
      middleNote,
      measuresCount: measureCount,
      noteDuration
    });
    setRecordingState(recorderRef.current.getState());
    const music = recorderRef.current.toMultiSheetQuestion();
    setRecordedMusic(music);
    
    // Update transposed versions when original changes
    if (showAllKeys && music.voices.length > 0) {
      setTransposedMusic(transposeToAllKeys(music, keySignature));
    }
  }, [keySignature, middleNote, measureCount, noteDuration, showAllKeys]);
  
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
          setTransposedMusic(transposeToAllKeys(music, keySignature));
        }
      }
    }
  }, [midiNotes, showAllKeys, keySignature]);
  
  // Reset the recording
  const handleReset = () => {
    recorderRef.current.reset();
    setRecordingState(recorderRef.current.getState());
    setRecordedMusic(recorderRef.current.toMultiSheetQuestion());
    setTransposedMusic([]);
  };

  // Toggle showing all keys
  const handleToggleAllKeys = () => {
    const newValue = !showAllKeys;
    setShowAllKeys(newValue);
    
    if (newValue && recordedMusic.voices.length > 0) {
      setTransposedMusic(transposeToAllKeys(recordedMusic, keySignature));
    }
  };
  
  // Get the current duration display name
  const currentDuration = NOTE_DURATIONS.find(d => d.value === noteDuration) || NOTE_DURATIONS[1];
  
  // Create dropdown items for duration selection
  const durationItems = React.useMemo(() => 
    NOTE_DURATIONS.map(duration => ({
      label: duration.label,
      onClick: () => setNoteDuration(duration.value)
    })),
    [setNoteDuration]
  );

  // Calculate progress percentage
  const progressPercentage = recordingState.totalPositions > 0 
    ? (recordingState.currentPosition / recordingState.totalPositions) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Music Notation</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-2">Note Duration</label>
          <Dropdown 
            label={currentDuration.label} 
            items={durationItems} 
          />
        </div>
        
        <div>
          <NumberAdjuster
            label="Number of Measures"
            value={measureCount}
            onValueChange={setMeasureCount}
            min={1}
            max={8}
            allowManualInput={false}
          />
        </div>
      </div>
      
      <div>
        <div className="flex justify-between mb-1 text-sm">
          <span>Recording Progress:</span>
          <span>
            Position {recordingState.currentPosition} of {recordingState.totalPositions}
            {recordingState.isComplete ? " (Complete)" : ""}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={showAllKeys}
              onChange={handleToggleAllKeys}
            />
            Show in all 12 keys
          </label>
        </div>
        <Button 
          variant="outline" 
          onClick={handleReset}
        >
          Reset Recording
        </Button>
      </div>
      
      {!showAllKeys ? (
        // Show only current key
        <div className="p-4 border rounded">
          {recordedMusic.voices.length > 0 ? (
            <MusicNotation data={recordedMusic} />
          ) : (
            <div className="flex justify-center items-center h-40 text-gray-500">
              Play notes on your MIDI device to record music
            </div>
          )}
        </div>
      ) : (
        // Show all 12 keys
        <div>
          <h4 className="text-md font-medium mb-2">Original Key ({keySignature})</h4>
          <div className="p-4 border rounded mb-4">
            {recordedMusic.voices.length > 0 ? (
              <MusicNotation data={recordedMusic} />
            ) : (
              <div className="flex justify-center items-center h-40 text-gray-500">
                Play notes on your MIDI device to record music
              </div>
            )}
          </div>
          
          {transposedMusic.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-md font-medium">Transposed Keys</h4>
              {transposedMusic.map((music, index) => (
                <div key={music.key} className="p-4 border rounded">
                  <h5 className="text-sm font-medium mb-2">Key of {music.key}</h5>
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
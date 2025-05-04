import React from 'react';
import Dropdown from './Dropdown';
import NumberAdjuster from './NumberAdjuster';
import { Button } from './Button';

// Note durations with their display labels
export const NOTE_DURATIONS = [
  { value: 'w', label: 'Whole Note (𝅝)' },
  { value: 'h', label: 'Half Note (𝅗𝅥)' },
  { value: 'q', label: 'Quarter Note (𝅘𝅥)' },
  { value: '8', label: 'Eighth Note (𝅘𝅥𝅮)' },
  { value: '16', label: 'Sixteenth Note (𝅘𝅥𝅯)' }
];

interface MusicNotationControlsProps {
  noteDuration: string;
  setNoteDuration: (duration: string) => void;
  measureCount: number;
  setMeasureCount: (count: number) => void;
  onClear?: () => void;
  isRecording?: boolean;
  recordingPosition?: number;
  totalPositions?: number;
}

/**
 * Component for controlling music notation settings
 */
const MusicNotationControls: React.FC<MusicNotationControlsProps> = ({
  noteDuration,
  setNoteDuration,
  measureCount,
  setMeasureCount,
  onClear,
  isRecording = false,
  recordingPosition = 0,
  totalPositions = 0
}) => {
  // Find the current duration label
  const currentDuration = NOTE_DURATIONS.find(d => d.value === noteDuration) || NOTE_DURATIONS[1];
  
  // Create dropdown items for duration selection
  const durationItems = React.useMemo(() => 
    NOTE_DURATIONS.map(duration => ({
      label: duration.label,
      onClick: () => setNoteDuration(duration.value)
    })),
    [setNoteDuration]
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-2">Notation Settings</h3>
      
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
      
      {isRecording && totalPositions > 0 && (
        <div className="mt-2">
          <div className="mb-1">Recording Progress:</div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${(recordingPosition / totalPositions) * 100}%` }}
            ></div>
          </div>
          <div className="text-sm mt-1">
            Position {recordingPosition} of {totalPositions}
          </div>
        </div>
      )}
      
      {onClear && (
        <div className="flex justify-end mt-2">
          <Button 
            variant="outline" 
            onClick={onClear}
          >
            Clear Notation
          </Button>
        </div>
      )}
    </div>
  );
};

export default MusicNotationControls;
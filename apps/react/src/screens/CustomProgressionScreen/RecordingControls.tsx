import React from 'react';

interface RecordingControlsProps {
  recordingMode: 'off' | 'recording';
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSaveCurrentChord: () => void;
  onClearCurrentChord: () => void;
  isChordEmpty: boolean;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  recordingMode,
  onStartRecording,
  onStopRecording,
  onSaveCurrentChord,
  onClearCurrentChord,
  isChordEmpty
}) => {
  return (
    <div className="mb-4">
      <div className="flex gap-2 mb-2">
        {recordingMode === 'off' ? (
          <button 
            onClick={onStartRecording}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Start Recording
          </button>
        ) : (
          <>
            <button 
              onClick={onStopRecording}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Stop Recording
            </button>
            <button 
              onClick={onSaveCurrentChord} 
              disabled={isChordEmpty}
              className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
            >
              Save Chord
            </button>
            <button 
              onClick={onClearCurrentChord} 
              disabled={isChordEmpty}
              className="px-4 py-2 bg-gray-500 text-white rounded disabled:bg-gray-300"
            >
              Clear Chord
            </button>
          </>
        )}
      </div>
      
      {recordingMode !== 'off' && (
        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
          <p>Recording: Active</p>
        </div>
      )}
    </div>
  );
};

export default RecordingControls;
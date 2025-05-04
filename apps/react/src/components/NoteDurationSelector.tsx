import React from 'react';
import Dropdown from './Dropdown';

interface NoteDurationSelectorProps {
  duration: string;
  onDurationChange: (duration: string) => void;
}

// Available note durations with display labels
export const NOTE_DURATIONS = [
  { value: 'w', label: 'Whole Note (𝅝)' },
  { value: 'h', label: 'Half Note (𝅗𝅥)' },
  { value: 'q', label: 'Quarter Note (𝅘𝅥)' },
  { value: '8', label: 'Eighth Note (𝅘𝅥𝅮)' },
  { value: '16', label: 'Sixteenth Note (𝅘𝅥𝅯)' }
];

/**
 * A component for selecting musical note durations
 */
const NoteDurationSelector: React.FC<NoteDurationSelectorProps> = ({
  duration,
  onDurationChange
}) => {
  // Find the currently selected duration
  const selectedDuration = NOTE_DURATIONS.find(d => d.value === duration) || NOTE_DURATIONS[1]; // Default to half note
  
  // Create dropdown items for note durations
  const durationItems = React.useMemo(
    () => NOTE_DURATIONS.map((d) => ({
      label: d.label,
      onClick: () => onDurationChange(d.value)
    })),
    [onDurationChange]
  );

  return (
    <div className="w-full">
      <label className="block mb-2">Note Duration</label>
      <Dropdown 
        label={selectedDuration.label} 
        items={durationItems} 
      />
    </div>
  );
};

export default NoteDurationSelector;
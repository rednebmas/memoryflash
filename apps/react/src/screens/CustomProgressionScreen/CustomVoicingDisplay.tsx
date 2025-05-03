import React from 'react';
import { MusicNotation } from '../../components/MusicNotation';
import { SheetNote } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { createMultiSheetCard } from './utils';

interface CustomVoicingDisplayProps {
  rightHandNotes: SheetNote[];
  leftHandNotes: SheetNote[];
  selectedKey: string;
  title: string;
  scale?: number;
}

const CustomVoicingDisplay: React.FC<CustomVoicingDisplayProps> = ({
  rightHandNotes,
  leftHandNotes,
  selectedKey,
  title,
  scale = 1
}) => {
  if (rightHandNotes.length === 0 && leftHandNotes.length === 0) {
    return null;
  }

  const multiSheetCard = createMultiSheetCard(rightHandNotes, leftHandNotes, selectedKey);

  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="p-4 bg-white dark:bg-gray-900 rounded shadow">
        <MusicNotation
          multiSheetCard={multiSheetCard}
          scale={scale}
        />
      </div>
    </div>
  );
};

export default CustomVoicingDisplay;
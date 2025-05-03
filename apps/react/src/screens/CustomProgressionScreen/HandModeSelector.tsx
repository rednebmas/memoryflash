import React from 'react';
import { SegmentButton } from '../../components/SegmentButton';

type HandMode = 'right' | 'left' | 'both';

interface HandModeSelectorProps {
  currentHandMode: HandMode;
  onChange: (mode: HandMode) => void;
}

const HandModeSelector: React.FC<HandModeSelectorProps> = ({ 
  currentHandMode, 
  onChange 
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">Hand Mode</label>
      <div className="flex gap-2">
        <SegmentButton
          isActive={currentHandMode === 'right'}
          onClick={() => onChange('right')}
        >
          Right Hand
        </SegmentButton>
        <SegmentButton
          isActive={currentHandMode === 'left'}
          onClick={() => onChange('left')}
        >
          Left Hand
        </SegmentButton>
        <SegmentButton
          isActive={currentHandMode === 'both'}
          onClick={() => onChange('both')}
        >
          Both Hands
        </SegmentButton>
      </div>
    </div>
  );
};

export default HandModeSelector;
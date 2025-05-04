import React from 'react';
import { Button } from './Button';

interface NumberAdjusterProps {
  value: number;
  onValueChange: (newValue: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  inputWidth?: string;
  allowManualInput?: boolean;
}

/**
 * A reusable number adjustment component with increment/decrement buttons
 */
const NumberAdjuster: React.FC<NumberAdjusterProps> = ({
  value,
  onValueChange,
  min = 0,
  max = Infinity,
  step = 1,
  label,
  inputWidth = 'w-20',
  allowManualInput = true
}) => {
  const adjustValue = (amount: number) => {
    const newValue = Math.min(max, Math.max(min, value + amount));
    onValueChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    if (!isNaN(newValue)) {
      onValueChange(Math.min(max, Math.max(min, newValue)));
    }
  };

  return (
    <div>
      {label && <label className="block mb-2">{label}</label>}
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => adjustValue(-step)}
          disabled={value <= min}
        >
          -
        </Button>
        
        {allowManualInput ? (
          <input
            type="number"
            className={`${inputWidth} px-2 py-1 border rounded`}
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={step}
          />
        ) : (
          <span className="text-center px-2">{value}</span>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => adjustValue(step)}
          disabled={value >= max}
        >
          +
        </Button>
      </div>
    </div>
  );
};

export default NumberAdjuster;
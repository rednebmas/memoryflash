import React from 'react';
import { BaseInput, BaseInputProps } from './BaseInput';

export const NumberInput = React.forwardRef<HTMLInputElement, BaseInputProps>((props, ref) => (
	<BaseInput type="number" ref={ref} {...props} />
));
NumberInput.displayName = 'NumberInput';

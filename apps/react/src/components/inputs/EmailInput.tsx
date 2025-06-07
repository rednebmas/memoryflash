import React from 'react';
import { InputField, InputFieldProps } from './InputField';

export const EmailInput: React.FC<Omit<InputFieldProps, 'type'>> = (props) => (
	<InputField type="email" autoComplete="email" {...props} />
);

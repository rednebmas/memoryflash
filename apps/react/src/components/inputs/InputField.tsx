import React from 'react';
import { BaseInput, BaseInputProps } from './BaseInput';

export interface InputFieldProps extends BaseInputProps {
	label: string;
	id: string;
}

export const InputField: React.FC<InputFieldProps> = ({ label, id, ...props }) => (
	<div>
		<label htmlFor={id} className="block text-sm font-medium leading-6 text-gray-900">
			{label}
		</label>
		<div className="mt-2">
			<BaseInput id={id} {...props} />
		</div>
	</div>
);

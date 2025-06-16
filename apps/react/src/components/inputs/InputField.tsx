import React from 'react';
import { BaseInput, BaseInputProps } from './BaseInput';

export interface InputFieldProps extends BaseInputProps {
	label: string;
	id: string;
	afterElement?: React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({
	label,
	id,
	afterElement,
	className = '',
	...props
}) => (
	<div>
		<label htmlFor={id} className="block text-sm font-medium leading-6 text-gray-900">
			{label}
		</label>
		<div className="mt-2 relative">
			<BaseInput
				id={id}
				className={`${afterElement ? 'pr-10' : ''} ${className}`}
				{...props}
			/>
			{afterElement}
		</div>
	</div>
);

import React from 'react';
import { BaseTextArea, BaseTextAreaProps } from './BaseTextArea';

export interface TextAreaFieldProps extends BaseTextAreaProps {
	label: string;
	id: string;
	afterElement?: React.ReactNode;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
	label,
	id,
	afterElement,
	className = '',
	...props
}) => (
	<div>
		<label htmlFor={id} className="block text-sm font-medium leading-6 text-fg">
			{label}
		</label>
		<div className="mt-2 relative">
			<BaseTextArea
				id={id}
				className={`${afterElement ? 'pr-10' : ''} ${className}`}
				{...props}
			/>
			{afterElement}
		</div>
	</div>
);

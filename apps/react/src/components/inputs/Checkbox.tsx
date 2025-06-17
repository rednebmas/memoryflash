import React from 'react';

export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
	({ className = '', ...props }, ref) => (
		<input
			ref={ref}
			type="checkbox"
			className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 ${className}`}
			{...props}
		/>
	),
);

Checkbox.displayName = 'Checkbox';

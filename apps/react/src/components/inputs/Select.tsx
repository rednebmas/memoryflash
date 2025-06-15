import React from 'react';

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
	({ className = '', children, ...props }, ref) => (
		<select ref={ref} className={`form-select rounded ${className}`} {...props}>
			{children}
		</select>
	),
);
Select.displayName = 'Select';

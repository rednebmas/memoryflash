import React from 'react';

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
	({ className = '', children, ...props }, ref) => (
		<select
			ref={ref}
			className={`block w-full rounded-md border-0 py-1.5 bg-white dark:bg-gray-800 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 ${className}`}
			{...props}
		>
			{children}
		</select>
	),
);
Select.displayName = 'Select';

import React from 'react';

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
	({ className = '', children, ...props }, ref) => (
		<select
			ref={ref}
			className={`block w-full rounded-md border border-default py-2 px-3 bg-surface text-fg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-150 sm:text-sm ${className}`}
			{...props}
		>
			{children}
		</select>
	),
);
Select.displayName = 'Select';

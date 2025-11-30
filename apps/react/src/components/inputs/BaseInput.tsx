import React from 'react';

export type BaseInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const BaseInput = React.forwardRef<HTMLInputElement, BaseInputProps>(
	({ className = '', ...props }, ref) => (
		<input
			ref={ref}
			className={`block w-full rounded-md border border-default py-2 px-3 bg-surface text-fg placeholder:text-lm-muted dark:placeholder:text-dm-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-150 sm:text-sm ${className}`}
			{...props}
		/>
	),
);
BaseInput.displayName = 'BaseInput';

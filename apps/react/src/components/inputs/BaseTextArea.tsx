import React from 'react';

export type BaseTextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const BaseTextArea = React.forwardRef<HTMLTextAreaElement, BaseTextAreaProps>(
	({ className = '', ...props }, ref) => (
		<textarea
			ref={ref}
			className={`block w-full rounded-md border-0 py-1.5 bg-white dark:bg-gray-800 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 resize-y min-h-[80px] ${className}`}
			{...props}
		/>
	),
);
BaseTextArea.displayName = 'BaseTextArea';

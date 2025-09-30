import React from 'react';
import { Spinner } from './Spinner';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	loading?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className = '', children, loading = false, disabled, ...props }, ref) => {
		const isDisabled = loading || disabled;
		const baseClasses =
			'flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 transition-colors';
		const enabledPalette =
			'bg-blue-600 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600';
		const disabledPalette = 'bg-slate-300 text-slate-600 cursor-not-allowed shadow-none';
		return (
			<button
				ref={ref}
				className={`${baseClasses} ${isDisabled ? disabledPalette : enabledPalette} ${className}`.trim()}
				disabled={isDisabled}
				{...props}
			>
				{loading ? (
					<Spinner svgClassName="w-5 h-5 text-transparent fill-gray-100" />
				) : (
					children
				)}
			</button>
		);
	},
);
Button.displayName = 'Button';

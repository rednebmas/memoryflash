import React from 'react';
import clsx from 'clsx';
import { Spinner } from '../feedback/Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	loading?: boolean;
	variant?: ButtonVariant;
};

const variantStyles: Record<ButtonVariant, { enabled: string; disabled: string }> = {
	primary: {
		enabled:
			'bg-blue-600 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
		disabled: 'bg-slate-300 text-slate-600 cursor-not-allowed shadow-none',
	},
	secondary: {
		enabled:
			'bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
		disabled:
			'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500',
	},
	outline: {
		enabled:
			'bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-600 dark:hover:bg-gray-700',
		disabled:
			'bg-white text-gray-400 cursor-not-allowed ring-1 ring-inset ring-gray-200 dark:bg-gray-800 dark:text-gray-500 dark:ring-gray-700',
	},
	danger: {
		enabled:
			'bg-red-600 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600',
		disabled: 'bg-red-300 text-red-100 cursor-not-allowed shadow-none',
	},
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{ className = '', children, loading = false, disabled, variant = 'primary', ...props },
		ref,
	) => {
		const isDisabled = loading || disabled;
		const baseClasses =
			'inline-flex justify-center items-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 transition-colors';
		const styles = variantStyles[variant];
		return (
			<button
				ref={ref}
				className={clsx(
					baseClasses,
					isDisabled ? styles.disabled : styles.enabled,
					className,
				)}
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

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
			'bg-accent text-white hover:bg-accent-hover dark:bg-[#e8e8ea] dark:text-[#1a1a1a] dark:hover:bg-[#d4d4d6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
		disabled:
			'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500',
	},
	secondary: {
		enabled:
			'bg-gray-100 text-lm-fg hover:bg-gray-200 dark:bg-dm-elevated dark:text-dm-fg dark:hover:bg-white/15',
		disabled:
			'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-dm-surface dark:text-gray-500',
	},
	outline: {
		enabled:
			'bg-transparent text-lm-muted hover:bg-gray-100 dark:text-dm-muted dark:hover:bg-white/5',
		disabled: 'bg-transparent text-gray-300 cursor-not-allowed dark:text-gray-600',
	},
	danger: {
		enabled:
			'bg-red-600 text-white hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600',
		disabled: 'bg-red-300 text-red-100 cursor-not-allowed',
	},
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{ className = '', children, loading = false, disabled, variant = 'primary', ...props },
		ref,
	) => {
		const isDisabled = loading || disabled;
		const baseClasses =
			'inline-flex justify-center items-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-150';
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
					<Spinner svgClassName="w-5 h-5 text-transparent fill-current" />
				) : (
					children
				)}
			</button>
		);
	},
);
Button.displayName = 'Button';

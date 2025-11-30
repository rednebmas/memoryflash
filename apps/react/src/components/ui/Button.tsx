import React from 'react';
import clsx from 'clsx';
import { Spinner } from '../feedback/Spinner';
import {
	ButtonVariant,
	buttonBaseClasses,
	variantEnabledStyles,
	variantDisabledStyles,
} from './buttonStyles';

export type { ButtonVariant };

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	loading?: boolean;
	variant?: ButtonVariant;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{ className = '', children, loading = false, disabled, variant = 'primary', ...props },
		ref,
	) => {
		const isDisabled = loading || disabled;
		return (
			<button
				ref={ref}
				className={clsx(
					buttonBaseClasses,
					isDisabled ? variantDisabledStyles[variant] : variantEnabledStyles[variant],
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

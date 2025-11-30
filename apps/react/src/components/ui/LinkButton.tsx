import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import clsx from 'clsx';
import { ButtonVariant } from './Button';

export type LinkButtonProps = LinkProps & {
	variant?: ButtonVariant;
	className?: string;
};

const variantStyles: Record<ButtonVariant, string> = {
	primary:
		'bg-accent text-white hover:bg-accent-hover dark:bg-[#e8e8ea] dark:text-[#1a1a1a] dark:hover:bg-[#d4d4d6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
	secondary:
		'bg-gray-100 text-lm-fg hover:bg-gray-200 dark:bg-dm-elevated dark:text-dm-fg dark:hover:bg-white/15',
	outline:
		'bg-transparent text-lm-muted hover:bg-gray-100 dark:text-dm-muted dark:hover:bg-white/5',
	danger: 'bg-red-600 text-white hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600',
};

export const LinkButton: React.FC<LinkButtonProps> = ({
	variant = 'primary',
	className = '',
	children,
	...props
}) => {
	const baseClasses =
		'inline-flex justify-center items-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-150';

	return (
		<Link className={clsx(baseClasses, variantStyles[variant], className)} {...props}>
			{children}
		</Link>
	);
};

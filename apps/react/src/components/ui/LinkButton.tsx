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
		'bg-blue-600 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
	secondary:
		'bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
	outline:
		'bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-600 dark:hover:bg-gray-700',
	danger: 'bg-red-600 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600',
};

export const LinkButton: React.FC<LinkButtonProps> = ({
	variant = 'primary',
	className = '',
	children,
	...props
}) => {
	const baseClasses =
		'inline-flex justify-center items-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 transition-colors';

	return (
		<Link className={clsx(baseClasses, variantStyles[variant], className)} {...props}>
			{children}
		</Link>
	);
};

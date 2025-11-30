import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import clsx from 'clsx';
import { ButtonVariant, buttonBaseClasses, variantEnabledStyles } from './buttonStyles';

export type LinkButtonProps = LinkProps & {
	variant?: ButtonVariant;
	className?: string;
};

export const LinkButton: React.FC<LinkButtonProps> = ({
	variant = 'primary',
	className = '',
	children,
	...props
}) => (
	<Link className={clsx(buttonBaseClasses, variantEnabledStyles[variant], className)} {...props}>
		{children}
	</Link>
);

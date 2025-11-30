import React from 'react';
import clsx from 'clsx';

type HeadingLevel = 'h1' | 'h2' | 'h3';

interface PageTitleProps {
	as?: HeadingLevel;
	children: React.ReactNode;
	className?: string;
}

export const PageTitle: React.FC<PageTitleProps> = ({
	as: Component = 'h1',
	children,
	className,
}) => {
	return (
		<Component
			className={clsx('text-xl font-semibold text-gray-900 dark:text-white', className)}
		>
			{children}
		</Component>
	);
};

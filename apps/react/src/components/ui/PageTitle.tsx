import React from 'react';
import clsx from 'clsx';

type HeadingLevel = 'h1' | 'h2' | 'h3';

interface PageTitleProps {
	as?: HeadingLevel;
	children: React.ReactNode;
	className?: string;
}

const headingStyles: Record<HeadingLevel, string> = {
	h1: 'text-3xl font-semibold tracking-tight',
	h2: 'text-2xl font-semibold tracking-tight',
	h3: 'text-xl font-semibold tracking-tight',
};

export const PageTitle: React.FC<PageTitleProps> = ({
	as: Component = 'h1',
	children,
	className,
}) => {
	return (
		<Component className={clsx(headingStyles[Component], 'text-fg', className)}>
			{children}
		</Component>
	);
};

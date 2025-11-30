import React from 'react';
import clsx from 'clsx';

export interface ContentCardProps {
	children: React.ReactNode;
	className?: string;
	spacing?: 'sm' | 'md';
	centered?: boolean;
}

export const ContentCard: React.FC<ContentCardProps> = ({
	children,
	className,
	spacing = 'md',
	centered = false,
}) => {
	return (
		<div
			className={clsx(
				'bg-surface rounded-xl border border-default p-6 shadow-sm dark:shadow-none',
				spacing === 'sm' ? 'space-y-3' : 'space-y-4',
				centered && 'text-center',
				className,
			)}
		>
			{children}
		</div>
	);
};

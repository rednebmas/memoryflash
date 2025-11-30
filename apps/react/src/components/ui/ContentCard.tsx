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
				'bg-white rounded-lg shadow p-6 dark:bg-gray-800',
				spacing === 'sm' ? 'space-y-3' : 'space-y-4',
				centered && 'text-center',
				className,
			)}
		>
			{children}
		</div>
	);
};

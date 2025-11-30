import React from 'react';
import clsx from 'clsx';

interface EmptyStateProps {
	message: string;
	className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, className }) => {
	return (
		<p className={clsx('text-center text-gray-500 dark:text-gray-400 py-8', className)}>
			{message}
		</p>
	);
};

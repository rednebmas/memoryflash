import React from 'react';
import clsx from 'clsx';

interface SegmentedControlProps {
	children: React.ReactNode;
	variant?: 'default' | 'compact';
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
	children,
	variant = 'default',
}) => {
	return (
		<div
			className={clsx(
				'flex rounded-lg',
				variant === 'default' && 'gap-2 p-1 bg-gray-100 dark:bg-gray-700',
				variant === 'compact' &&
					'border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-600 dark:bg-gray-800',
			)}
		>
			{children}
		</div>
	);
};

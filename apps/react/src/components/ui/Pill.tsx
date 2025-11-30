import clsx from 'clsx';
import React from 'react';

interface PillProps {
	text: string;
	theme: 'gray' | 'green';
	onClick?: () => void;
	ring?: boolean;
}

export const Pill: React.FunctionComponent<PillProps> = ({ text, theme, onClick, ring = true }) => {
	const colorClasses = {
		gray: 'bg-gray-50 text-gray-600 ring-gray-500/10 dark:bg-dm-surface dark:text-dm-fg dark:ring-dm-border',
		green: 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-800/30 dark:text-green-400 dark:ring-green-500/30',
	};

	return (
		<span
			className={clsx(
				`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${colorClasses[theme]}`,
				onClick && 'cursor-pointer transition-opacity active:opacity-70',
				ring && 'ring-1 ring-inset',
			)}
			onMouseDown={(e) => e.preventDefault()}
			onClick={onClick}
			tabIndex={0}
		>
			{text}
		</span>
	);
};

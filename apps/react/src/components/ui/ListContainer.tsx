import React from 'react';
import clsx from 'clsx';

export interface ListContainerProps {
	children: React.ReactNode;
	className?: string;
}

export const ListContainer: React.FC<ListContainerProps> = ({ children, className }) => {
	return (
		<div
			className={clsx(
				'bg-white rounded-lg shadow divide-y divide-gray-100 dark:bg-gray-800 dark:divide-gray-700',
				className,
			)}
		>
			{children}
		</div>
	);
};

export interface ListItemProps {
	children: React.ReactNode;
	className?: string;
	onClick?: () => void;
}

export const ListItem: React.FC<ListItemProps> = ({ children, className, onClick }) => {
	return (
		<div
			className={clsx(
				'p-4',
				onClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700',
				className,
			)}
			onClick={onClick}
		>
			{children}
		</div>
	);
};

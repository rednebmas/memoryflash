import React from 'react';

interface CardProps {
	className?: string;
	children?: React.ReactNode;
	style?: React.CSSProperties;
	contentContainerClassName?: string;
}

export const Card: React.FC<CardProps> = ({
	className,
	contentContainerClassName,
	children,
	style,
}) => {
	return (
		<div
			className={`overflow-visible bg-surface rounded-xl border border-default shadow-sm dark:shadow-none ${className}`}
		>
			<div
				className={`px-4 py-5 sm:p-6 h-full flex flex-col ${contentContainerClassName}`}
				style={style}
			>
				{children}
			</div>
		</div>
	);
};

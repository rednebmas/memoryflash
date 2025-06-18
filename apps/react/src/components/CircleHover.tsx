import React from 'react';
import { Link } from 'react-router-dom';

interface CircleHoverProps {
	children: React.ReactNode;
	link?: string;
	onClick?: () => void;
	className?: string;
}

export const CircleHover = React.forwardRef<HTMLDivElement, CircleHoverProps>(
	({ children, link, onClick, className = '' }, ref) => {
		const content = (
			<div
				ref={ref}
				className={`p-2 hover:bg-gray-200 active:bg-gray-200 rounded-full cursor-pointer hover:bg-opacity-50 transition-all ${className}`}
				onClick={onClick}
			>
				{children}
			</div>
		);

		return link ? (
			<Link to={link} className="inline-block">
				{content}
			</Link>
		) : (
			content
		);
	},
);

CircleHover.displayName = 'CircleHover';

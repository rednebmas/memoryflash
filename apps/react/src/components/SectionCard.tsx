import React, { useCallback } from 'react';
import { Card } from './Card';
import { useNavigate } from 'react-router-dom';

interface SectionCardProps {
	title: string;
	subTitle?: string;
	link: string;
	btnText: string;
	className?: string;
	menu?: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({
	title,
	btnText,
	className,
	subTitle,
	link,
	menu,
}) => {
	const navigate = useNavigate();
	const handleClick = useCallback(() => {
		navigate(link);
	}, [navigate, link]);

	return (
		<Card
			className={`w-44 h-44 group ${className}`}
			contentContainerClassName="justify-between items-center relative"
		>
			{menu && (
				<div className="absolute top-2 right-2 sm:opacity-0 sm:group-hover:opacity-100">
					{menu}
				</div>
			)}
			<div className="text-center">
				<div className="text-sm font-medium">{title}</div>
				{subTitle && <div className="text-[0.6rem]">{subTitle}</div>}
			</div>

			<button
				type="button"
				className="rounded-md w-full bg-blue-500 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 text-center"
				onClick={handleClick}
			>
				{btnText}
			</button>
		</Card>
	);
};

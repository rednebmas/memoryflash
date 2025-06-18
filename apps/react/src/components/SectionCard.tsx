import React from 'react';
import { Card } from './Card';
import { Link } from 'react-router-dom';

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

			<Link className="w-full" to={link}>
				<button className="rounded-md w-full bg-blue-500 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ">
					{btnText}
				</button>
			</Link>
		</Card>
	);
};

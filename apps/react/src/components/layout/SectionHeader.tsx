import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { circleClassName } from '../ui/CircleHover';

interface SectionHeaderProps {
	title: string;
	text?: string;
	Icon?: (props: { color?: string }) => JSX.Element;
	collapsible?: boolean;
	isCollapsed?: boolean;
	onToggle?: () => void;
}

const CollapseChevron: React.FC<{ isCollapsed: boolean }> = ({ isCollapsed }) => (
	<span className={`${circleClassName} group-hover:bg-gray-200 dark:group-hover:bg-white/15`}>
		<ChevronDownIcon
			className={`w-4 h-4 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
		/>
	</span>
);

export const SectionHeader: React.FC<SectionHeaderProps> = ({
	title,
	text,
	Icon,
	collapsible = false,
	isCollapsed = false,
	onToggle,
}) => {
	const content = (
		<>
			<div className="flex items-center justify-between">
				<div className="caption font-medium">{title}</div>
				{collapsible && <CollapseChevron isCollapsed={isCollapsed} />}
			</div>
			{text && <div className="text-[0.6rem]">{text}</div>}
		</>
	);
	return (
		<div className="flex space-x-1 -mt-1">
			{Icon && (
				<div className="flex">
					<Icon />
				</div>
			)}
			{collapsible ? (
				<button
					type="button"
					onClick={onToggle}
					aria-expanded={!isCollapsed}
					className="group flex flex-col flex-1 text-left cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 rounded"
				>
					{content}
				</button>
			) : (
				<div className="flex flex-col flex-1">{content}</div>
			)}
		</div>
	);
};

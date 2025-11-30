import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { CircleHover } from '../ui/CircleHover';

interface SectionHeaderProps {
	title: string;
	text?: string;
	Icon?: (props: { color?: string }) => JSX.Element;
	collapsible?: boolean;
	isCollapsed?: boolean;
	onToggle?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
	title,
	text,
	Icon,
	collapsible = false,
	isCollapsed = false,
	onToggle,
}) => {
	return (
		<div className="flex space-x-1 -mt-1">
			{Icon && (
				<div className="flex">
					<Icon />
				</div>
			)}
			<div className="flex flex-col flex-1">
				<div className="flex items-center justify-between">
					<div className="caption font-medium">{title}</div>
					{collapsible && (
						<CircleHover onClick={onToggle}>
							<ChevronDownIcon
								className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
							/>
						</CircleHover>
					)}
				</div>
				{text && <div className="text-[0.6rem]">{text}</div>}
			</div>
		</div>
	);
};

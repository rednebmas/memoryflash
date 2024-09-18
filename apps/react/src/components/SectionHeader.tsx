import React from 'react';

interface SectionHeaderProps {
	title: string;
	text?: string;
	Icon?: (props: { color?: string }) => JSX.Element;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
	title,
	text,
	Icon
}) => {
	return (
		<div className='flex space-x-1'>
			{Icon && (
				<div className='flex'>
					<Icon />
				</div>
			)}
			<div className='flex flex-col'>
				<div className='text-xs font-medium'>{title}</div>
				{text && <div className='text-[0.6rem]'>{text}</div>}
			</div>
		</div>
	);
};

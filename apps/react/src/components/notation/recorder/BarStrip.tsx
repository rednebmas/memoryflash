import React from 'react';
import clsx from 'clsx';

interface BarStripProps {
	count: number;
	selected: number;
	onSelect: (index: number) => void;
}

export const BarStrip: React.FC<BarStripProps> = ({ count, selected, onSelect }) => (
	<div className="flex flex-wrap gap-1.5">
		{Array.from({ length: count + 1 }, (_, i) => (
			<button
				key={i}
				onClick={() => onSelect(i)}
				className={clsx(
					'h-8 min-w-8 px-2 rounded text-sm border border-default transition-colors',
					i === selected
						? 'bg-blue-500 text-white'
						: 'hover:bg-gray-100 dark:hover:bg-dm-elevated',
				)}
				title={i === count ? 'New bar at the end' : `Bar ${i + 1}`}
			>
				{i === count ? '+' : i + 1}
			</button>
		))}
	</div>
);

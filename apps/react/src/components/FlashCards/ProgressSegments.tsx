import clsx from 'clsx';
import React from 'react';

interface ProgressSegmentsProps {
	total: number;
	correctCount: number;
}

export const ProgressSegments: React.FC<ProgressSegmentsProps> = ({ total, correctCount }) => (
	<span className="flex gap-1 w-full">
		{Array.from({ length: total }).map((_, i) => (
			<span
				key={i}
				className={clsx(
					'h-2 flex-1 rounded-full transition',
					i < correctCount ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600',
				)}
			/>
		))}
	</span>
);

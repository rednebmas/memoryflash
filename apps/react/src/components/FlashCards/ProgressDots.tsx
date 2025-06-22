import clsx from 'clsx';
import React from 'react';

interface ProgressDotsProps {
	total: number;
	correctCount?: number;
}

export const ProgressDots: React.FC<ProgressDotsProps> = ({ total, correctCount = 0 }) => (
	<span className="flex gap-4 justify-center pt-5">
		{Array.from({ length: total }).map((_, i) => (
			<span
				key={i}
				className={clsx(
					'w-4 h-4 rounded-lg transition',
					i < correctCount ? 'bg-green-500 ring-2 ring-green-300' : 'bg-gray-300',
				)}
			></span>
		))}
	</span>
);

import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';

interface StreakChipProps {
	className?: string;
}

export const StreakChip: React.FC<StreakChipProps> = ({ className }) => {
	const count = useAppSelector((state) => state.userStats.userStats?.currentStreak ?? 0);
	const displayCount = Number.isFinite(count) && count > 0 ? count : 0;
	const [animate, setAnimate] = useState(false);
	const prevCount = useRef<number | undefined>(undefined);

	useEffect(() => {
		if (prevCount.current !== undefined && count > prevCount.current) {
			setAnimate(true);
			const timeout = setTimeout(() => setAnimate(false), 800);
			return () => clearTimeout(timeout);
		}
	}, [count]);

	useEffect(() => {
		prevCount.current = count;
	}, [count]);

	return (
		<div
			className={clsx(
				'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium',
				'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
				animate ? 'animate-bounce' : '',
				className,
			)}
			aria-label={`Current streak ${displayCount} days`}
		>
			<span>🔥</span>
			<span>{displayCount}</span>
		</div>
	);
};

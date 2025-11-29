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
				'inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-800 shadow-sm',
				animate ? 'animate-bounce' : '',
				className,
			)}
			aria-label={`Current streak ${displayCount} days`}
		>
			<span className="text-base">🔥</span>
			<span>{displayCount}</span>
		</div>
	);
};

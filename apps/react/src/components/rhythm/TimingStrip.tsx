import clsx from 'clsx';
import { TimingTier } from 'MemoryFlashCore/src/lib/rhythm/types';
import {
	rhythmStatusSelector,
	timingStripSelector,
} from 'MemoryFlashCore/src/redux/selectors/rhythmSelectors';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { TempoProgress } from './TempoProgress';

const TIER_COLORS: Record<TimingTier, string> = {
	perfect: 'bg-green-500',
	good: 'bg-lime-400',
	ok: 'bg-amber-400',
	miss: 'bg-red-500',
};

export const TimingStrip: React.FC = () => {
	const strip = useAppSelector(timingStripSelector);
	const status = useAppSelector(rhythmStatusSelector);
	if (!status) return null;

	return (
		<div className="flex flex-col items-center gap-1 pt-3">
			<p className="caption">{status}</p>
			{strip && (
				<>
					<div className="relative w-64 h-6 rounded-full bg-gray-200 dark:bg-gray-700">
						<div className="absolute left-1/2 top-0 h-full w-px bg-gray-400" />
						{strip.ticks.map((tick, i) => (
							<span
								key={i}
								className={clsx(
									'absolute top-1 h-4 w-1.5 -ml-0.5 rounded-full',
									TIER_COLORS[tick.tier],
								)}
								style={{ left: `${tick.position * 100}%` }}
							/>
						))}
					</div>
					<div className="flex w-64 justify-between caption">
						<span>early</span>
						<span>{strip.summary}</span>
						<span>late</span>
					</div>
				</>
			)}
			<TempoProgress />
		</div>
	);
};

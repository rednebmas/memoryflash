import {
	caughtUpSelector,
	nextDueSelector,
} from 'MemoryFlashCore/src/redux/selectors/activeSchedulerSelector';
import { formatDue } from 'MemoryFlashCore/src/lib/schedulers/formatDue';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';

export const StudyCaughtUpState: React.FC = () => {
	const caughtUp = useAppSelector(caughtUpSelector);
	const nextDue = useAppSelector(nextDueSelector);
	if (!caughtUp) return null;
	return (
		<div className="text-center text-gray-500 w-full space-y-1">
			<div className="text-lg text-gray-900 dark:text-gray-100">All caught up</div>
			{nextDue && <div>Next card due {formatDue(nextDue, Date.now())}.</div>}
			<div className="text-xs">Switch the scheduler to Speed to keep practicing.</div>
		</div>
	);
};

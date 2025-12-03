import React, { useEffect, useState } from 'react';
import { Layout, PageTitle } from '../../components';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { getStreakAttempts } from 'MemoryFlashCore/src/redux/actions/get-streak-attempts-action';
import {
	streakActivitySelector,
	StreakDayGroup,
} from 'MemoryFlashCore/src/redux/selectors/streakActivitySelector';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const DayRow: React.FC<{ group: StreakDayGroup }> = ({ group }) => {
	const [expanded, setExpanded] = useState(false);

	return (
		<div className="rounded-xl border border-default bg-surface shadow-sm dark:shadow-none">
			<button
				onClick={() => setExpanded(!expanded)}
				className="flex w-full items-center justify-between p-4 text-left"
			>
				<div className="flex items-center gap-3">
					{expanded ? (
						<ChevronDownIcon className="h-5 w-5 text-muted" />
					) : (
						<ChevronRightIcon className="h-5 w-5 text-muted" />
					)}
					<span className="font-medium text-fg">{group.formattedDay}</span>
				</div>
				<span className="text-sm text-muted">
					{group.attempts.length} attempt{group.attempts.length !== 1 && 's'}
				</span>
			</button>
			{expanded && (
				<div className="border-t border-default px-4 pb-4">
					<div className="mt-3 flex flex-col gap-2">
						{group.attempts.map((attempt) => (
							<div
								key={attempt._id}
								className="flex items-center justify-between rounded-lg bg-app px-3 py-2 text-sm"
							>
								<span className="text-muted">{attempt.formattedTime}</span>
								<div className="flex items-center gap-3">
									<span
										className={
											attempt.correct
												? 'text-green-600 dark:text-green-400'
												: 'text-red-600 dark:text-red-400'
										}
									>
										{attempt.correct ? 'Correct' : 'Incorrect'}
									</span>
									<span className="text-muted">
										{attempt.timeTaken.toFixed(1)}s
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

const UserStatsDisplay: React.FC = () => {
	const userStats = useAppSelector((state) => state.userStats.userStats);

	if (!userStats) {
		return (
			<div className="rounded-xl border border-default bg-surface p-4 shadow-sm dark:shadow-none">
				<span className="text-muted">No user stats available</span>
			</div>
		);
	}

	return (
		<div className="rounded-xl border border-default bg-surface p-4 shadow-sm dark:shadow-none">
			<h3 className="mb-3 font-semibold text-fg">User Stats</h3>
			<div className="grid grid-cols-2 gap-2 text-sm">
				<span className="text-muted">Current Streak:</span>
				<span className="font-medium text-fg">{userStats.currentStreak} days</span>
				<span className="text-muted">Longest Streak:</span>
				<span className="font-medium text-fg">{userStats.longestStreak} days</span>
				<span className="text-muted">Last Activity:</span>
				<span className="font-medium text-fg">{userStats.lastActivityDate ?? 'None'}</span>
				<span className="text-muted">Timezone:</span>
				<span className="font-medium text-fg">{userStats.timezone}</span>
			</div>
		</div>
	);
};

export const StreakActivityScreen: React.FC = () => {
	const dispatch = useAppDispatch();
	const streakDays = useAppSelector(streakActivitySelector);

	useEffect(() => {
		dispatch(getStreakAttempts());
	}, [dispatch]);

	return (
		<Layout>
			<div className="flex flex-col gap-6">
				<PageTitle>Streak Activity</PageTitle>
				<UserStatsDisplay />
				<div>
					<h3 className="mb-3 font-semibold text-fg">
						Attempts by Day ({streakDays.length} days)
					</h3>
					{streakDays.length === 0 ? (
						<p className="text-muted">No attempts recorded yet.</p>
					) : (
						<div className="flex flex-col gap-3">
							{streakDays.map((group) => (
								<DayRow key={group.day} group={group} />
							))}
						</div>
					)}
				</div>
			</div>
		</Layout>
	);
};

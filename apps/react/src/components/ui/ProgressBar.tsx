import clsx from 'clsx';

export const ProgressBar: React.FC<{ progress: number; className?: string }> = ({
	progress,
	className = 'w-64 h-2',
}) => (
	<div className={clsx('rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden', className)}>
		<div
			className={clsx('h-full', progress >= 1 ? 'bg-green-500' : 'bg-blue-500')}
			style={{ width: `${Math.min(1, progress) * 100}%` }}
		/>
	</div>
);

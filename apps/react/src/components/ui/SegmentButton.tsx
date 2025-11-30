import clsx from 'clsx';

interface SegmentedButtonProps {
	text: string;
	Icon?: (props: { color: string }) => JSX.Element;
	active: boolean;
	onClick: () => void;
	variant?: 'default' | 'compact';
}

export const SegmentButton: React.FC<SegmentedButtonProps> = ({
	text,
	Icon,
	active,
	onClick,
	variant = 'default',
}) => {
	return (
		<button
			type="button"
			onClick={onClick}
			className={clsx(
				'cursor-pointer flex flex-1 justify-center items-center rounded-md font-medium',
				variant === 'default' && 'p-2 text-base space-x-0.5',
				variant === 'compact' && 'px-3 py-1 text-xs',
				variant === 'default' && active && 'text-white bg-blue-600',
				variant === 'default' && !active && 'text-black dark:text-white bg-transparent',
				variant === 'compact' &&
					active &&
					'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900',
				variant === 'compact' &&
					!active &&
					'text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700',
			)}
		>
			{Icon && <Icon color={active ? '#fff' : ''} />}
			<span>{text}</span>
		</button>
	);
};

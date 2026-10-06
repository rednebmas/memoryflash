import clsx from 'clsx';
import React from 'react';
import { ENTER } from 'MemoryFlashCore/src/lib/chordPad';

interface PadKeyProps {
	label: string;
	lines?: string[];
	active?: boolean;
	wrong?: boolean;
	className?: string;
	onPress: () => void;
}

export const PadKey: React.FC<PadKeyProps> = ({
	label,
	lines = [label],
	active,
	wrong,
	className,
	onPress,
}) => {
	const isEnter = label === ENTER;
	return (
		<button
			type="button"
			aria-label={label}
			onPointerDown={(e) => e.preventDefault()}
			onClick={onPress}
			className={clsx(
				'h-12 rounded-[10px] border font-medium select-none transition-colors',
				label.length > 2 ? 'text-sm' : 'text-lg',
				isEnter && 'col-span-2',
				wrong
					? 'bg-red-500 border-red-500 text-white'
					: active || isEnter
						? 'bg-accent border-accent text-white'
						: 'bg-surface border-default text-fg active:bg-elevated',
				className,
			)}
		>
			{lines.map((line) => (
				<span key={line} className="block leading-tight">
					{line}
				</span>
			))}
		</button>
	);
};

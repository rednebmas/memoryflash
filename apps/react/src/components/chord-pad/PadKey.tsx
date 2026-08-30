import clsx from 'clsx';
import React from 'react';
import { ENTER } from 'MemoryFlashCore/src/lib/chordPad';

interface PadKeyProps {
	label: string;
	active?: boolean;
	onPress: () => void;
}

export const PadKey: React.FC<PadKeyProps> = ({ label, active, onPress }) => {
	const isEnter = label === ENTER;
	return (
		<button
			type="button"
			onPointerDown={(e) => e.preventDefault()}
			onClick={onPress}
			className={clsx(
				'h-12 rounded-[10px] border font-medium select-none transition-colors',
				label.length > 2 ? 'text-sm' : 'text-lg',
				isEnter && 'col-span-2',
				active || isEnter
					? 'bg-accent border-accent text-white'
					: 'bg-surface border-default text-fg active:bg-elevated',
			)}
		>
			{label}
		</button>
	);
};

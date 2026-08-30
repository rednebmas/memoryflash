import clsx from 'clsx';
import React from 'react';
import { prettyChordSymbol } from 'MemoryFlashCore/src/lib/romanNumerals';

interface ChordChipsProps {
	chords: string[];
	invalid?: string[];
	variant?: 'default' | 'roman';
}

export const ChordChips: React.FC<ChordChipsProps> = ({
	chords,
	invalid = [],
	variant = 'default',
}) => (
	<div className="flex gap-1.5 flex-wrap">
		{chords.map((chord, i) => (
			<span
				key={i}
				className={clsx(
					'inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-semibold',
					invalid.includes(chord) && 'bg-red-500/20 text-red-500',
					!invalid.includes(chord) && variant === 'roman' && 'bg-accent/20 text-accent',
					!invalid.includes(chord) && variant === 'default' && 'bg-elevated text-fg',
				)}
			>
				{prettyChordSymbol(chord)}
			</span>
		))}
	</div>
);

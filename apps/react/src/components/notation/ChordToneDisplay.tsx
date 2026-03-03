import React from 'react';
import { ChordMemoryChord } from 'MemoryFlashCore/src/types/Cards';

interface ToneChipProps {
	tone: string;
	required: boolean;
	onToggle?: () => void;
}

const ToneChip: React.FC<ToneChipProps> = ({ tone, required, onToggle }) => (
	<button
		type="button"
		onClick={onToggle}
		className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
			required
				? 'bg-blue-600 text-white'
				: 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-200 border border-dashed border-gray-400 dark:border-gray-500'
		}`}
	>
		{tone}
	</button>
);

interface ChordToneDisplayProps {
	chord: ChordMemoryChord;
	onToggleTone?: (tone: string) => void;
}

export const ChordToneDisplay: React.FC<ChordToneDisplayProps> = ({ chord, onToggleTone }) => {
	const isInvalid = chord.requiredTones.length === 0 && chord.optionalTones.length === 0;
	const allTones = [...chord.requiredTones, ...chord.optionalTones];

	return (
		<div
			className={`rounded-lg p-2 text-sm ${isInvalid ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}
		>
			<div className="font-medium mb-1">{chord.chordName}</div>
			{isInvalid ? (
				<div className="text-xs">Invalid chord</div>
			) : (
				<div className="flex gap-1 flex-wrap">
					{allTones.map((tone) => (
						<ToneChip
							key={tone}
							tone={tone}
							required={chord.requiredTones.includes(tone)}
							onToggle={onToggleTone ? () => onToggleTone(tone) : undefined}
						/>
					))}
				</div>
			)}
		</div>
	);
};

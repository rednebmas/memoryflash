import React from 'react';
import { majorKeys } from 'MemoryFlashCore/src/lib/notes';
import { Checkbox } from './inputs';

interface KeySelectorProps {
	selected: boolean[];
	currentIndex: number;
	onChange: (next: boolean[]) => void;
}

export const KeySelector: React.FC<KeySelectorProps> = ({ selected, currentIndex, onChange }) => {
	const toggle = (i: number) => {
		if (i === currentIndex) return;
		const next = [...selected];
		next[i] = !next[i];
		onChange(next);
	};

	const selectAll = () => onChange(selected.map(() => true));

	const selectNone = () => onChange(selected.map((_, i) => i === currentIndex));

	return (
		<div className="flex flex-col gap-2 pb-4 items-start">
			<div className="flex gap-2 text-sm">
				<button type="button" onClick={selectAll} className="underline text-blue-600">
					All
				</button>
				<button type="button" onClick={selectNone} className="underline text-blue-600">
					None
				</button>
			</div>
			<div className="grid grid-cols-4 gap-2">
				{majorKeys.map((k, i) => (
					<label key={k} className="flex items-center gap-1">
						<Checkbox
							checked={selected[i]}
							onChange={() => toggle(i)}
							disabled={i === currentIndex}
						/>
						<span>{k}</span>
					</label>
				))}
			</div>
		</div>
	);
};

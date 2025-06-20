import React from 'react';
import { majorKeys } from 'MemoryFlashCore/src/lib/notes';
import { Checkbox } from './inputs';

interface KeySelectorProps {
	selected: boolean[];
	toggle: (i: number) => void;
	selectAll: () => void;
	selectNone: () => void;
}

export const KeySelector: React.FC<KeySelectorProps> = ({
	selected,
	toggle,
	selectAll,
	selectNone,
}) => {
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
						<Checkbox checked={selected[i]} onChange={() => toggle(i)} />
						<span>{k}</span>
					</label>
				))}
			</div>
		</div>
	);
};

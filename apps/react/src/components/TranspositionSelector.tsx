import React from 'react';
import { majorKeys } from 'MemoryFlashCore/src/lib/notes';
import { sameKey } from 'MemoryFlashCore/src/lib/transpositionGroups';
import { Checkbox } from './inputs';

interface TranspositionSelectorProps {
	selected: boolean[];
	onChange: (next: boolean[]) => void;
	currentKeySig?: string;
}

export const TranspositionSelector: React.FC<TranspositionSelectorProps> = ({
	selected,
	onChange,
	currentKeySig,
}) => {
	const toggle = (i: number) =>
		onChange(
			selected.map((on, j) => (sameKey(majorKeys[j], majorKeys[i]) ? !selected[i] : on)),
		);

	const selectAll = () => onChange(selected.map(() => true));

	const selectNone = () => onChange(majorKeys.map((k) => sameKey(k, currentKeySig)));

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
			<div className="grid grid-cols-6 gap-2">
				{majorKeys.map((k, i) => {
					const isCurrentKeySig = sameKey(k, currentKeySig);
					return (
						<label
							key={k}
							className={`flex items-center gap-1 ${isCurrentKeySig ? 'opacity-50 pointer-events-none' : ''}`}
						>
							<Checkbox
								checked={selected[i]}
								onChange={() => toggle(i)}
								disabled={isCurrentKeySig}
							/>
							<span>{k}</span>
						</label>
					);
				})}
			</div>
		</div>
	);
};

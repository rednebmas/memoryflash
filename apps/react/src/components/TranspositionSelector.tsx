import React from 'react';
import { majorKeys } from 'MemoryFlashCore/src/lib/notes';
import { Checkbox } from './inputs';

interface TranspositionSelectorProps {
	selected: boolean[];
	onChange: (next: boolean[]) => void;
	currentKeySig?: string;
	existingKeys?: string[];
}

export const TranspositionSelector: React.FC<TranspositionSelectorProps> = ({
	selected,
	onChange,
	currentKeySig,
	existingKeys = [],
}) => {
	const toggle = (i: number) => {
		const next = [...selected];
		next[i] = !next[i];
		onChange(next);
	};

	const selectAll = () => onChange(selected.map(() => true));

	const selectNone = () => onChange(selected.map(() => false));

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
					const exists = existingKeys.includes(k);
					const locked = k === currentKeySig || exists;
					return (
						<label
							key={k}
							title={exists ? 'Already in this deck' : undefined}
							className={`flex items-center gap-1 ${locked ? 'opacity-50 pointer-events-none' : ''}`}
						>
							<Checkbox
								checked={selected[i] || exists}
								onChange={() => toggle(i)}
								disabled={locked}
							/>
							<span>{k}</span>
						</label>
					);
				})}
			</div>
			{existingKeys.length > 0 && (
				<p className="text-sm text-muted">
					Greyed-out ticked keys already have a transposed copy in this deck. Use the card
					list to delete one.
				</p>
			)}
		</div>
	);
};

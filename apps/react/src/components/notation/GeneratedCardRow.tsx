import React, { useState } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { GeneratedCard } from 'MemoryFlashCore/src/types/GeneratedCards';
import { chordNameToRomanNumeral } from 'MemoryFlashCore/src/lib/romanNumerals';
import { Checkbox, InputField } from '../inputs';
import { CircleHover } from '../ui/CircleHover';
import { Pill } from '../ui/Pill';
import { ChordChips } from './ChordChips';

interface GeneratedCardRowProps {
	card: GeneratedCard;
	selected: boolean;
	onToggle: () => void;
	onChange: (changes: Partial<GeneratedCard>) => void;
	onRemove: () => void;
}

export const GeneratedCardRow: React.FC<GeneratedCardRowProps> = ({
	card,
	selected,
	onToggle,
	onChange,
	onRemove,
}) => {
	const [editing, setEditing] = useState(false);
	const isRoman = card.notation === 'romanNumerals';
	const numerals = card.chords.map((c) => chordNameToRomanNumeral(card.key, c) ?? '?');

	return (
		<div className="grid grid-cols-[auto_1fr_auto] gap-3 py-3 border-t border-default items-start">
			<Checkbox checked={selected} onChange={onToggle} className="mt-1" />
			<div className={`flex flex-col gap-2 ${selected ? '' : 'opacity-50'}`}>
				{editing ? (
					<EditFields card={card} onChange={onChange} />
				) : (
					<div className="flex items-center gap-2 flex-wrap">
						<span className="font-semibold">{card.prompt}</span>
						<Pill text={`Pattern ${card.patternId}`} theme="gray" />
						<span className="caption">{card.key}</span>
					</div>
				)}
				{isRoman && <ChordChips chords={numerals} variant="roman" />}
				<ChordChips chords={card.chords} invalid={card.invalidChords} />
				{card.invalidChords.length > 0 && (
					<span className="text-xs text-red-500">
						Unrecognised chord — edit before creating
					</span>
				)}
			</div>
			<div className="flex gap-1 text-muted">
				<CircleHover onClick={() => setEditing(!editing)}>
					<PencilIcon className="w-4 h-4" />
				</CircleHover>
				<CircleHover onClick={onRemove}>
					<TrashIcon className="w-4 h-4" />
				</CircleHover>
			</div>
		</div>
	);
};

const EditFields: React.FC<{
	card: GeneratedCard;
	onChange: (c: Partial<GeneratedCard>) => void;
}> = ({ card, onChange }) => (
	<div className="flex flex-col gap-2">
		<InputField
			id="gen-prompt"
			label="Prompt"
			value={card.prompt}
			onChange={(e) => onChange({ prompt: e.target.value })}
		/>
		<InputField
			id="gen-chords"
			label="Chords"
			value={card.chords.join(' ')}
			onChange={(e) => onChange({ chords: e.target.value.split(/[\s,]+/).filter(Boolean) })}
		/>
	</div>
);

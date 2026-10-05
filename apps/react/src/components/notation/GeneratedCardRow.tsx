import React, { useState } from 'react';
import { GeneratedChordCard } from 'MemoryFlashCore/src/types/GeneratedCards';
import { chordNameToRomanNumeral } from 'MemoryFlashCore/src/lib/romanNumerals';
import { InputField } from '../inputs';
import { Pill } from '../ui/Pill';
import { ChordChips } from './ChordChips';
import { GeneratedRowFrame, RowFrameProps } from './GeneratedRowFrame';

interface GeneratedCardRowProps extends RowFrameProps {
	card: GeneratedChordCard;
	onChange: (changes: Partial<GeneratedChordCard>) => void;
}

export const GeneratedCardRow: React.FC<GeneratedCardRowProps> = ({ card, onChange, ...frame }) => {
	const [editing, setEditing] = useState(false);
	const isRoman = card.notation === 'romanNumerals';
	const numerals = card.chords.map((c) => chordNameToRomanNumeral(card.key, c) ?? '?');

	return (
		<GeneratedRowFrame {...frame} onEdit={() => setEditing(!editing)}>
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
		</GeneratedRowFrame>
	);
};

const EditFields: React.FC<{
	card: GeneratedChordCard;
	onChange: (c: Partial<GeneratedChordCard>) => void;
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

import React from 'react';
import clsx from 'clsx';
import { ChordSlot } from 'MemoryFlashCore/src/lib/chordNames';
import { invalidChordNames } from 'MemoryFlashCore/src/lib/chordTones';
import { prettyChordSymbol, toAsciiAccidentals } from 'MemoryFlashCore/src/lib/romanNumerals';
import { BaseInput } from '../inputs';

interface ChordNameFieldProps {
	position: number;
	slot: ChordSlot;
	value?: string;
	onChange: (value: string) => void;
}

export const ChordNameField: React.FC<ChordNameFieldProps> = ({
	position,
	slot,
	value,
	onChange,
}) => {
	const typed = !!value?.trim();
	const invalid = typed && invalidChordNames([toAsciiAccidentals(value ?? '')]).length > 0;
	return (
		<label className="flex flex-col gap-1">
			<BaseInput
				aria-label={`Chord ${position} name`}
				value={value ?? slot.detected ?? ''}
				placeholder={slot.detected ?? '?'}
				onChange={(e) => onChange(e.target.value)}
				onFocus={(e) => e.target.select()}
				className={clsx(!typed && 'italic text-muted', invalid && '!border-red-500')}
			/>
			<span className="text-xs text-muted truncate">
				{slot.notes.map(prettyChordSymbol).join(' ')}
			</span>
		</label>
	);
};

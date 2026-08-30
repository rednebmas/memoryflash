import React from 'react';
import { InputField, Select, TextAreaField } from '../inputs';
import { allKeys } from 'MemoryFlashCore/src/lib/notes';
import { ChordNotation } from 'MemoryFlashCore/src/types/Cards';
import { ChordToneDisplay } from './ChordToneDisplay';
import { ChordMemorySettings } from './defaultSettings';
import { parseChordProgression } from './parseChordProgression';
import { toggleChordTone } from './toggleChordTone';

interface ChordProgressionInputProps {
	chordMemory: ChordMemorySettings;
	textPrompt: string;
	onChange: (chordMemory: ChordMemorySettings) => void;
	onTextPromptChange: (textPrompt: string) => void;
}

export const ChordProgressionInput: React.FC<ChordProgressionInputProps> = ({
	chordMemory,
	textPrompt,
	onChange,
	onTextPromptChange,
}) => {
	const handleProgressionChange = (progression: string) => {
		onChange({ ...chordMemory, progression, chordTones: parseChordProgression(progression) });
	};

	const handleToggleTone = (chordIndex: number, tone: string) => {
		onChange(toggleChordTone(chordMemory, chordIndex, tone));
	};

	return (
		<div className="flex flex-col gap-3 w-full">
			<InputField
				id="chord-progression"
				label="Chord Progression"
				placeholder="e.g., Cm7 F7 Bbmaj7"
				value={chordMemory.progression}
				onChange={(e) => handleProgressionChange(e.target.value)}
			/>
			<TextAreaField
				id="chord-text-prompt"
				label="Text Prompt (optional)"
				placeholder="e.g., Autumn Leaves - Verse"
				value={textPrompt}
				onChange={(e) => onTextPromptChange(e.target.value)}
			/>
			<div className="grid grid-cols-2 gap-3">
				<label className="flex flex-col gap-2 text-sm font-medium">
					Key
					<Select
						id="chord-key"
						value={chordMemory.key}
						onChange={(e) => onChange({ ...chordMemory, key: e.target.value })}
					>
						<option value="">None</option>
						{allKeys.map((k) => (
							<option key={k} value={k}>
								{k}
							</option>
						))}
					</Select>
				</label>
				<label className="flex flex-col gap-2 text-sm font-medium">
					Study as
					<Select
						id="chord-notation"
						value={chordMemory.notation}
						disabled={!chordMemory.key}
						onChange={(e) =>
							onChange({ ...chordMemory, notation: e.target.value as ChordNotation })
						}
					>
						<option value="chordNames">Chord names</option>
						<option value="romanNumerals">Roman numerals</option>
					</Select>
				</label>
			</div>
			{chordMemory.chordTones.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{chordMemory.chordTones.map((chord, i) => (
						<ChordToneDisplay
							key={i}
							chord={chord}
							onToggleTone={(tone) => handleToggleTone(i, tone)}
						/>
					))}
				</div>
			)}
		</div>
	);
};

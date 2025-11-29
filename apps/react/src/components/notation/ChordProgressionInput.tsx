import React from 'react';
import { InputField } from '../inputs';
import { ChordToneDisplay } from './ChordToneDisplay';
import { ChordMemorySettings } from './defaultSettings';
import { parseChordProgression } from './parseChordProgression';
import { toggleChordTone } from './toggleChordTone';

interface ChordProgressionInputProps {
	chordMemory: ChordMemorySettings;
	onChange: (chordMemory: ChordMemorySettings) => void;
}

export const ChordProgressionInput: React.FC<ChordProgressionInputProps> = ({
	chordMemory,
	onChange,
}) => {
	const handleProgressionChange = (progression: string) => {
		onChange({ progression, chordTones: parseChordProgression(progression) });
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

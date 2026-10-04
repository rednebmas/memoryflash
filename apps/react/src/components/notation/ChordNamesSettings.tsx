import React, { useMemo } from 'react';
import { chordSlots, romanNumerals, withChordNames } from 'MemoryFlashCore/src/lib/chordNames';
import { SettingsSection } from './SettingsSection';
import { ChordNameField } from './ChordNameField';
import { useScoreEditor } from './ScoreEditor';
import { NotationSettingsState } from './defaultSettings';

type ChordNameSettings = Pick<NotationSettingsState, 'chordNames'>;

interface ChordNamesSettingsProps {
	settings: ChordNameSettings;
	onChange: (changes: Partial<ChordNameSettings>) => void;
}

export const ChordNamesSettings: React.FC<ChordNamesSettingsProps> = ({ settings, onChange }) => {
	const { question } = useScoreEditor();
	const slots = useMemo(() => chordSlots(question), [question]);
	const numerals = useMemo(
		() => romanNumerals(withChordNames(question, settings.chordNames)),
		[question, settings.chordNames],
	);
	if (!slots.length) return null;
	const setName = (i: number, name: string) =>
		onChange({ chordNames: slots.map((_, j) => (j === i ? name : settings.chordNames[j])) });
	return (
		<SettingsSection title="Chord Names">
			<div className="space-y-3">
				<p className="text-sm text-muted">
					Guessed from the notes (italic). Type over a guess to fix it; typed names are
					saved with the card.
				</p>
				<div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
					{slots.map((slot, i) => (
						<ChordNameField
							key={`${slot.beat}-${i}`}
							position={i + 1}
							slot={slot}
							value={settings.chordNames[i]}
							onChange={(name) => setName(i, name)}
						/>
					))}
				</div>
				<p className="text-sm">Roman numerals: {numerals}</p>
			</div>
		</SettingsSection>
	);
};

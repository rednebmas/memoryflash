import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { chordSlots } from 'MemoryFlashCore/src/lib/chordNames';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { selectTransposedCopyCount } from 'MemoryFlashCore/src/redux/selectors/transposedCopiesSelector';
import { Checkbox } from '../inputs';
import { SettingsSection } from './SettingsSection';
import { ChordNameField } from './ChordNameField';
import { useScoreEditor } from './ScoreEditor';
import { NotationSettingsState } from './defaultSettings';

type ChordNameSettings = Pick<NotationSettingsState, 'chordNames' | 'syncCopies'>;

interface ChordNamesSettingsProps {
	settings: ChordNameSettings;
	onChange: (changes: Partial<ChordNameSettings>) => void;
}

export const ChordNamesSettings: React.FC<ChordNamesSettingsProps> = ({ settings, onChange }) => {
	const { question } = useScoreEditor();
	const { cardId } = useParams();
	const slots = useMemo(() => chordSlots(question), [question]);
	const copies = useAppSelector((state) => selectTransposedCopyCount(state, cardId, question));
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
				{copies > 0 && (
					<label className="flex items-center gap-2 text-sm">
						<Checkbox
							checked={settings.syncCopies}
							onChange={(e) => onChange({ syncCopies: e.target.checked })}
						/>
						<span>
							Also update {copies} transposed {copies === 1 ? 'copy' : 'copies'} in
							this deck (chord names and display mode)
						</span>
					</label>
				)}
			</div>
		</SettingsSection>
	);
};

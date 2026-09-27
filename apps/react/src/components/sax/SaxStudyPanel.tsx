import React from 'react';
import { Midi } from 'tonal';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { settingsActions } from 'MemoryFlashCore/src/redux/slices/settingsSlice';
import {
	currentSheetCardSelector,
	saxTypeSelector,
} from 'MemoryFlashCore/src/redux/selectors/instrumentSelector';
import { SAX_TYPES, SaxType } from 'MemoryFlashCore/src/lib/saxPitch';
import { Select } from '../inputs/Select';
import { SaxFingerings } from './SaxFingerings';
import { useSaxMicInput } from './useSaxMicInput';

const ListeningStatus: React.FC<{ heard?: number; error?: string }> = ({ heard, error }) => {
	if (error) return <p className="text-sm text-red-500">{error}</p>;
	const text =
		heard === undefined ? 'Listening… play the note' : `Hearing ${Midi.midiToNoteName(heard)}`;
	return <p className="text-sm text-muted">🎷 {text}</p>;
};

export const SaxStudyPanel: React.FC = () => {
	const dispatch = useAppDispatch();
	const card = useAppSelector(currentSheetCardSelector);
	const saxType = useAppSelector(saxTypeSelector);
	const { heard, error } = useSaxMicInput();

	return (
		<div className="flex flex-col items-center gap-4 py-6">
			<div className="flex items-center gap-4">
				<ListeningStatus heard={heard} error={error} />
				<Select
					className="w-36"
					aria-label="Saxophone type"
					value={saxType}
					onChange={(e) =>
						dispatch(settingsActions.setSaxType(e.target.value as SaxType))
					}
				>
					{SAX_TYPES.map((type) => (
						<option key={type} value={type}>
							{type[0].toUpperCase() + type.slice(1)} sax
						</option>
					))}
				</Select>
			</div>
			{card && <SaxFingerings question={card.question} />}
		</div>
	);
};

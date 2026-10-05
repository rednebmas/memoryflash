import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { InputField, TextAreaField } from '../inputs';
import { SettingCheckbox } from '../inputs/SettingCheckbox';
import { CheckboxGroup } from '../inputs/CheckboxGroup';
import { BasicErrorCard } from '../feedback/ErrorCard';
import { useAppDispatch } from 'MemoryFlashCore/src/redux/store';
import { useNetworkState } from 'MemoryFlashCore/src/redux/selectors/useNetworkState';
import { generateCards } from 'MemoryFlashCore/src/redux/actions/generate-cards-action';
import {
	GENERATED_CARD_TYPES,
	GenerateCardsInput,
	wantsChords,
} from 'MemoryFlashCore/src/types/GeneratedCards';
import { useDeckIdPath } from '../../screens/useDeckIdPath';
import { AiImageAttachment } from './AiImageAttachment';

interface AiGenerateInputProps {
	ai: GenerateCardsInput;
	onChange: (ai: GenerateCardsInput) => void;
}

const OPTIONS: { key: 'splitLongSections' | 'romanVariants'; label: string }[] = [
	{ key: 'splitLongSections', label: 'Split long sections into parts (≤ 8 chords or 4 bars)' },
	{ key: 'romanVariants', label: 'Also create roman numeral variants' },
];

const optionsFor = (ai: GenerateCardsInput) =>
	OPTIONS.filter((o) => o.key !== 'romanVariants' || wantsChords(ai.cardTypes));

export const AiGenerateInput: React.FC<AiGenerateInputProps> = ({ ai, onChange }) => {
	const dispatch = useAppDispatch();
	const { deckId } = useDeckIdPath();
	const { isLoading, error } = useNetworkState('generateCards');

	return (
		<div className="flex flex-col gap-4 w-full">
			<TextAreaField
				id="ai-text"
				label="Describe the cards you want, or paste chords + lyrics"
				placeholder={
					'"transcribe the melody" with a photo, "ii–V–I in all 12 keys with 7ths", or\n[Verse]\nBm        F#\nlyrics...'
				}
				className="min-h-[220px] font-mono text-xs"
				value={ai.text}
				onChange={(e) => onChange({ ...ai, text: e.target.value })}
			/>
			<AiImageAttachment image={ai.image} onChange={(image) => onChange({ ...ai, image })} />
			<InputField
				id="ai-instructions"
				label="Instructions (optional)"
				placeholder="e.g. skip the bridge, treat Verse 1 and 2 as one card"
				value={ai.instructions}
				onChange={(e) => onChange({ ...ai, instructions: e.target.value })}
			/>
			<CheckboxGroup
				title="Card types to generate"
				options={GENERATED_CARD_TYPES}
				value={ai.cardTypes}
				onChange={(cardTypes) => onChange({ ...ai, cardTypes })}
			/>
			{optionsFor(ai).map((o) => (
				<SettingCheckbox
					key={o.key}
					label={o.label}
					checked={ai[o.key]}
					onChange={(checked) => onChange({ ...ai, [o.key]: checked })}
				/>
			))}
			<Button
				onClick={() => deckId && dispatch(generateCards(deckId, ai))}
				disabled={!ai.text.trim() || !ai.cardTypes.length}
				loading={isLoading}
				className="self-start"
			>
				<SparklesIcon className="w-4 h-4 mr-1.5" /> Generate preview
			</Button>
			<span className="caption">
				Lyrics and photos are only used to generate cards and are not stored.
			</span>
			<BasicErrorCard error={error} />
		</div>
	);
};

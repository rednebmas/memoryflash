import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { Checkbox, InputField, TextAreaField } from '../inputs';
import { BasicErrorCard } from '../feedback/ErrorCard';
import { useAppDispatch } from 'MemoryFlashCore/src/redux/store';
import { useNetworkState } from 'MemoryFlashCore/src/redux/selectors/useNetworkState';
import { generateCards } from 'MemoryFlashCore/src/redux/actions/generate-cards-action';
import { GenerateCardsInput } from 'MemoryFlashCore/src/types/GeneratedCards';
import { useDeckIdPath } from '../../screens/useDeckIdPath';

interface AiGenerateInputProps {
	ai: GenerateCardsInput;
	onChange: (ai: GenerateCardsInput) => void;
}

const OPTIONS: { key: 'splitLongSections' | 'romanVariants'; label: string }[] = [
	{ key: 'splitLongSections', label: 'Split long sections into parts (≤ 8 chords)' },
	{ key: 'romanVariants', label: 'Also create roman numeral variants' },
];

export const AiGenerateInput: React.FC<AiGenerateInputProps> = ({ ai, onChange }) => {
	const dispatch = useAppDispatch();
	const { deckId } = useDeckIdPath();
	const { isLoading, error } = useNetworkState('generateCards');

	return (
		<div className="flex flex-col gap-4 w-full">
			<TextAreaField
				id="ai-text"
				label="Paste chords + lyrics, or describe the cards you want"
				placeholder={
					'[Verse]\nBm        F#\nlyrics...\n\nor: "ii–V–I in all 12 keys with 7ths"'
				}
				className="min-h-[220px] font-mono text-xs"
				value={ai.text}
				onChange={(e) => onChange({ ...ai, text: e.target.value })}
			/>
			<InputField
				id="ai-instructions"
				label="Instructions (optional)"
				placeholder="e.g. skip the bridge, treat Verse 1 and 2 as one card"
				value={ai.instructions}
				onChange={(e) => onChange({ ...ai, instructions: e.target.value })}
			/>
			{OPTIONS.map((o) => (
				<label key={o.key} className="flex items-center gap-2 text-sm">
					<Checkbox
						checked={ai[o.key]}
						onChange={(e) => onChange({ ...ai, [o.key]: e.target.checked })}
					/>
					<span>{o.label}</span>
				</label>
			))}
			<Button
				onClick={() => deckId && dispatch(generateCards(deckId, ai))}
				disabled={!ai.text.trim()}
				loading={isLoading}
				className="self-start"
			>
				<SparklesIcon className="w-4 h-4 mr-1.5" /> Generate preview
			</Button>
			<span className="caption">
				Lyrics are only used to find sections and are not stored.
			</span>
			<BasicErrorCard error={error} />
		</div>
	);
};

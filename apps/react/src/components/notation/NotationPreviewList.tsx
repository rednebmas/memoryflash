import React from 'react';
import { MusicNotation } from '../MusicNotation';
import { TextCardPrompt } from '../FlashCards/TextCardPrompt';
import { ScoreEditor } from './ScoreEditor';
import { MultiSheetQuestion } from 'MemoryFlashCore/src/types/MultiSheetCard';

interface PreviewCardProps {
	notation: React.ReactNode;
	total: number;
	showText: boolean;
	text: string;
}

const PreviewCard: React.FC<PreviewCardProps> = ({ notation, total, showText, text }) => (
	<div className="flex flex-col items-center gap-2">
		<div className="card-container flex flex-col items-center gap-2 w-[26rem]">
			{notation}
			{showText && <TextCardPrompt text={text} total={total} />}
		</div>
	</div>
);

interface NotationPreviewListProps {
	previews: MultiSheetQuestion[];
	cardType?: 'Sheet Music' | 'Text Prompt';
	textPrompt?: string;
	previewTextCard?: boolean;
	keySig: string;
}

export const NotationPreviewList: React.FC<NotationPreviewListProps> = ({
	previews,
	cardType,
	textPrompt,
	previewTextCard,
	keySig,
}) => {
	const base = previews.find((p) => p.key === keySig);
	const others = previews.filter((p) => p.key !== keySig);
	const showText = !!previewTextCard && cardType === 'Text Prompt';
	const prompt = textPrompt ?? '';
	return (
		<div className="flex flex-col items-center gap-5">
			<PreviewCard
				notation={<ScoreEditor />}
				total={base?.voices[0].stack.length ?? 0}
				showText={showText}
				text={prompt}
			/>
			{others.map((p, i) => (
				<PreviewCard
					key={i}
					notation={<MusicNotation data={p} />}
					total={p.voices[0].stack.length}
					showText={showText}
					text={prompt}
				/>
			))}
		</div>
	);
};

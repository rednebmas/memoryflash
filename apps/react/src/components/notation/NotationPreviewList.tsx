import React from 'react';
import { MusicNotation } from '../MusicNotation';
import { TextCardPrompt } from '../FlashCards/TextCardPrompt';
import { ScoreEditor } from './ScoreEditor';
import { MultiSheetQuestion } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { splitByKey } from 'MemoryFlashCore/src/lib/multiKeyTransposer';
import { CardType } from '../CardTypeDropdown';
import { SheetDisplayMode } from 'MemoryFlashCore/src/types/PresentationMode';
import { GeneratedCardsReview } from './GeneratedCardsReview';
import { romanNumeralPrompt } from 'MemoryFlashCore/src/lib/chordNames';

interface PreviewCardProps {
	notation: React.ReactNode;
	total: number;
	showText: boolean;
	text: string;
}

const PreviewCard: React.FC<PreviewCardProps> = ({ notation, total, showText, text }) => (
	<div className="flex w-full flex-col items-center gap-2">
		<div className="card-container flex w-full flex-col items-center gap-2">
			{notation}
			{showText && <TextCardPrompt text={text} total={total} />}
		</div>
	</div>
);

interface NotationPreviewListProps {
	previews: MultiSheetQuestion[];
	cardType?: CardType;
	displayModes?: SheetDisplayMode[];
	textPrompt?: string;
	previewTextCard?: boolean;
	keySig: string;
}

export const NotationPreviewList: React.FC<NotationPreviewListProps> = ({
	previews,
	cardType,
	displayModes,
	textPrompt,
	previewTextCard,
	keySig,
}) => {
	const { base, others } = splitByKey(previews, keySig);
	const baseStackLength = base?.voices?.[0]?.stack?.length ?? 0;
	const isRoman = cardType === 'Sheet Music' && !!displayModes?.includes('Roman Numerals');
	const showText = isRoman || (!!previewTextCard && cardType === 'Text Prompt');
	const prompt = textPrompt ?? '';
	const textFor = (q?: MultiSheetQuestion) => (isRoman && q ? romanNumeralPrompt(q) : prompt);

	if (cardType === 'Generate with AI') return <GeneratedCardsReview />;

	if (cardType === 'Chord Memory') {
		return (
			<div className="flex flex-col items-center gap-5">
				<div className="card-container flex flex-col items-center gap-2 w-[26rem]">
					<TextCardPrompt text={prompt} total={0} />
				</div>
			</div>
		);
	}

	return (
		<div
			className="flex w-full flex-col items-center gap-5"
			data-base-key={base?.key ?? ''}
			data-base-stack-length={baseStackLength}
		>
			<PreviewCard
				notation={<ScoreEditor />}
				total={baseStackLength}
				showText={showText}
				text={textFor(base)}
			/>
			{others.map((p, i) => (
				<PreviewCard
					key={i}
					notation={<MusicNotation data={p} />}
					total={p.voices?.[0]?.stack?.length ?? 0}
					showText={showText}
					text={textFor(p)}
				/>
			))}
		</div>
	);
};

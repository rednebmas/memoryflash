import React from 'react';
import { MusicNotation } from '../MusicNotation';
import { TextCardPrompt } from '../FlashCards/TextCardPrompt';
import { ScoreEditor } from './ScoreEditor';
import { MultiSheetQuestion } from 'MemoryFlashCore/src/types/MultiSheetCard';

interface NotationPreviewListProps {
	previews: any[];
	cardType?: 'Sheet Music' | 'Text Prompt';
	textPrompt?: string;
	previewTextCard?: boolean;
	keySig: string;
	resetSignal: number;
	onChange: (q: MultiSheetQuestion, full: boolean) => void;
}

export const NotationPreviewList: React.FC<NotationPreviewListProps> = ({
	previews,
	cardType,
	textPrompt,
	previewTextCard,
	keySig,
	resetSignal,
	onChange,
}) => (
	<div className="flex flex-col items-center gap-5">
		<ScoreEditor keySig={keySig} resetSignal={resetSignal} onChange={onChange} />
		{previews.map((p, i) => (
			<div key={i} className="flex flex-col items-center gap-2">
				<div className="card-container flex flex-col items-center gap-2 w-[26rem]">
					{previewTextCard && cardType === 'Text Prompt' ? (
						<TextCardPrompt text={textPrompt ?? ''} total={p.voices[0].stack.length} />
					) : (
						<MusicNotation data={p} />
					)}
				</div>
			</div>
		))}
	</div>
);

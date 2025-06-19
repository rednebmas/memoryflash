import React from 'react';
import { MusicNotation } from '../MusicNotation';
import { TextPromptPreview } from './TextPromptPreview';

interface NotationPreviewListProps {
	previews: any[];
	cardType?: 'Sheet Music' | 'Text Prompt';
	textPrompt?: string;
	previewTextCard?: boolean;
}

export const NotationPreviewList: React.FC<NotationPreviewListProps> = ({
	previews,
	cardType,
	textPrompt,
	previewTextCard,
}) => (
	<div className="flex flex-col items-center gap-5">
		{previews.map((p, i) => (
			<div key={i} className="flex flex-col items-center gap-2">
				<div className="card-container flex flex-col items-center gap-2 w-[26rem]">
					{previewTextCard && cardType === 'Text Prompt' ? (
						<TextPromptPreview
							text={textPrompt ?? ''}
							count={p.voices[0].stack.length}
						/>
					) : (
						<MusicNotation data={p} />
					)}
				</div>
			</div>
		))}
	</div>
);

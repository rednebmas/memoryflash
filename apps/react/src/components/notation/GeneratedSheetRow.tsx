import React from 'react';
import { GeneratedSheetCard } from 'MemoryFlashCore/src/types/GeneratedCards';
import { MusicNotation } from '../MusicNotation';
import { Pill } from '../ui/Pill';
import { GeneratedRowFrame, RowFrameProps } from './GeneratedRowFrame';

interface GeneratedSheetRowProps extends RowFrameProps {
	card: GeneratedSheetCard;
}

export const GeneratedSheetRow: React.FC<GeneratedSheetRowProps> = ({ card, ...frame }) => (
	<GeneratedRowFrame {...frame}>
		<div className="flex items-center gap-2 flex-wrap">
			<span className="font-semibold">{card.prompt}</span>
			<Pill text={card.type} theme="gray" />
		</div>
		<MusicNotation data={card.question} />
		{card.problems.map((problem) => (
			<span key={problem} className="text-xs text-red-500">
				{problem} — fix it after adding
			</span>
		))}
	</GeneratedRowFrame>
);

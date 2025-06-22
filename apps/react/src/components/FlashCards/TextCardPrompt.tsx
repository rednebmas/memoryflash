import React from 'react';
import { ProgressDots } from './ProgressDots';

interface TextCardPromptProps {
	text: string;
	total: number;
	correctCount?: number;
}

export const TextCardPrompt: React.FC<TextCardPromptProps> = ({
	text,
	total,
	correctCount = 0,
}) => (
	<div className="flex flex-col items-center justify-center text-center gap-2">
		<span className="pt-3">{text}</span>
		<div className="mb-auto">
			<ProgressDots total={total} correctCount={correctCount} />
		</div>
	</div>
);

import React from 'react';
import ReactMarkdown from 'react-markdown';
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
		<ReactMarkdown className="prose prose-sm max-w-none dark:prose-invert pt-3">
			{text}
		</ReactMarkdown>
		<div className="mb-auto">
			<ProgressDots total={total} correctCount={correctCount} />
		</div>
	</div>
);

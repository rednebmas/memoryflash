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
		<ReactMarkdown
			className="max-w-none pt-3 flex flex-col items-center gap-1"
			components={{
				h1: ({ children }) => <p className="heading-lg">{children}</p>,
				h2: ({ children }) => <p className="caption">{children}</p>,
				p: ({ children }) => <p className="heading-lg">{children}</p>,
			}}
		>
			{text}
		</ReactMarkdown>
		<div className="mb-auto">
			<ProgressDots total={total} correctCount={correctCount} />
		</div>
	</div>
);

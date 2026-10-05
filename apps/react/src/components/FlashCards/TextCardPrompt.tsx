import React from 'react';
import ReactMarkdown from 'react-markdown';
import { textPromptLines } from 'MemoryFlashCore/src/lib/textPrompt';
import { AttemptTime } from './AttemptTime';
import { ProgressSegments } from './ProgressSegments';

interface TextCardPromptProps {
	text: string;
	total: number;
	correctCount?: number;
	time?: number;
}

const headingClass = 'text-3xl tracking-tight leading-tight';

const PromptText: React.FC<{ text: string }> = ({ text }) => {
	const lines = textPromptLines(text);
	if (!lines)
		return (
			<ReactMarkdown
				className={`flex flex-col gap-1 font-extrabold ${headingClass} [&_*]:m-0 [&_h1]:text-3xl [&_h2]:text-3xl [&_h2]:font-medium [&_h2]:text-lm-muted dark:[&_h2]:text-dm-muted [&_p+p]:text-xl [&_p+p]:font-medium [&_p+p]:text-lm-muted dark:[&_p+p]:text-dm-muted`}
			>
				{text}
			</ReactMarkdown>
		);
	const [primary, secondary] = lines;
	return (
		<span className={`flex flex-col ${headingClass}`}>
			<span className="font-extrabold">{primary}</span>
			{secondary && <span className="font-medium text-muted">{secondary}</span>}
		</span>
	);
};

const Progress: React.FC<Omit<TextCardPromptProps, 'text'>> = ({
	total,
	correctCount = 0,
	time,
}) => (
	<>
		<div className="mt-6">
			<ProgressSegments total={total} correctCount={correctCount} />
		</div>
		<div className="flex justify-between mt-2">
			<span className="caption tabular-nums">
				{correctCount}/{total}
			</span>
			<AttemptTime time={time} />
		</div>
	</>
);

export const TextCardPrompt: React.FC<TextCardPromptProps> = ({ text, ...progress }) => (
	<div className="flex flex-col text-left min-w-[13rem] max-w-sm pt-5 pb-1">
		<PromptText text={text} />
		{progress.total > 0 && <Progress {...progress} />}
	</div>
);

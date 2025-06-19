import React from 'react';

interface TextPromptPreviewProps {
	text: string;
	count: number;
}

export const TextPromptPreview: React.FC<TextPromptPreviewProps> = ({ text, count }) => (
	<div className="flex flex-col items-center justify-center text-center gap-2">
		<span className="pt-3">{text}</span>
		<div className="mb-auto">
			<span className="flex gap-4 justify-center pt-5">
				{Array.from({ length: count }).map((_, i) => (
					<span key={i} className="w-4 h-4 rounded-lg bg-gray-300"></span>
				))}
			</span>
		</div>
	</div>
);

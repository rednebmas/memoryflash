import clsx from 'clsx';
import React from 'react';
import { Pill } from '../ui/Pill';

interface AnswerStripProps {
	committed: string[];
	pending: string;
	total: number;
	wrong: boolean;
	keyLabel?: string;
}

export const AnswerStrip: React.FC<AnswerStripProps> = ({
	committed,
	pending,
	total,
	wrong,
	keyLabel,
}) => (
	<div
		className={clsx(
			'flex items-center gap-2 h-14 px-1 rounded-[10px] overflow-x-auto',
			wrong && 'bg-red-500/10 ring-1 ring-inset ring-red-500/50',
		)}
	>
		{committed.map((chord, i) => (
			<Pill key={i} text={chord} theme="green" />
		))}
		<span
			className={clsx('text-[28px] font-semibold flex items-center', wrong && 'text-red-500')}
		>
			{pending}
			<span
				className={clsx('w-0.5 h-8 ml-0.5 rounded', wrong ? 'bg-red-500' : 'bg-accent')}
			/>
		</span>
		<span className="ml-auto caption whitespace-nowrap">
			{committed.length} / {total}
			{keyLabel && ` · ${keyLabel}`}
		</span>
	</div>
);

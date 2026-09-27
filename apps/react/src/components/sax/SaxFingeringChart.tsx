import React from 'react';
import { SaxKey } from 'MemoryFlashCore/src/lib/saxFingerings';

type KeyShape = { key: SaxKey; x: number; y: number; r?: number; label?: string };

const KEYS: KeyShape[] = [
	{ key: 'octave', x: 24, y: 16, label: 'Oct' },
	{ key: 'palmD', x: 10, y: 44, label: 'D' },
	{ key: 'palmEb', x: 10, y: 62, label: 'E♭' },
	{ key: 'palmF', x: 10, y: 80, label: 'F' },
	{ key: 'L1', x: 60, y: 48, r: 12 },
	{ key: 'bis', x: 60, y: 69, r: 4 },
	{ key: 'L2', x: 60, y: 90, r: 12 },
	{ key: 'L3', x: 60, y: 120, r: 12 },
	{ key: 'gSharp', x: 86, y: 132, label: 'G♯' },
	{ key: 'lowCSharp', x: 106, y: 132, label: 'C♯' },
	{ key: 'lowB', x: 86, y: 150, label: 'B' },
	{ key: 'lowBb', x: 106, y: 150, label: 'B♭' },
	{ key: 'sideE', x: 96, y: 182, label: 'E' },
	{ key: 'R1', x: 60, y: 182, r: 12 },
	{ key: 'R2', x: 60, y: 212, r: 12 },
	{ key: 'R3', x: 60, y: 242, r: 12 },
	{ key: 'lowEb', x: 86, y: 264, label: 'E♭' },
	{ key: 'lowC', x: 106, y: 264, label: 'C' },
];

const keyClass = (pressed: boolean) =>
	pressed
		? 'fill-blue-500 stroke-blue-500'
		: 'fill-transparent stroke-gray-400 dark:stroke-gray-500';

const SaxKeyShape: React.FC<{ shape: KeyShape; pressed: boolean }> = ({ shape, pressed }) => {
	if (shape.r) {
		return (
			<circle
				cx={shape.x}
				cy={shape.y}
				r={shape.r}
				strokeWidth={2}
				className={keyClass(pressed)}
			/>
		);
	}
	return (
		<g>
			<rect
				x={shape.x - 9}
				y={shape.y - 7}
				width={18}
				height={14}
				rx={4}
				strokeWidth={1.5}
				className={keyClass(pressed)}
			/>
			<text
				x={shape.x}
				y={shape.y + 3.5}
				textAnchor="middle"
				fontSize={8}
				className={pressed ? 'fill-white' : 'fill-gray-500 dark:fill-gray-400'}
			>
				{shape.label}
			</text>
		</g>
	);
};

export const SaxFingeringChart: React.FC<{ keys: SaxKey[]; className?: string }> = ({
	keys,
	className = 'w-32 h-72',
}) => (
	<svg
		viewBox="0 0 120 280"
		className={className}
		role="img"
		aria-label={`Pressed keys: ${keys.join(', ') || 'none'}`}
	>
		{KEYS.map((shape) => (
			<SaxKeyShape key={shape.key} shape={shape} pressed={keys.includes(shape.key)} />
		))}
	</svg>
);

import React, { useEffect, useState } from 'react';

interface ConfettiPiece {
	id: number;
	left: number;
	color: string;
	delay: number;
	duration: number;
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const Confetti: React.FC<{ show: boolean }> = ({ show }) => {
	const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

	useEffect(() => {
		if (show) {
			const newPieces: ConfettiPiece[] = Array.from({ length: 30 }, (_, i) => ({
				id: i,
				left: Math.random() * 100,
				color: COLORS[Math.floor(Math.random() * COLORS.length)],
				delay: Math.random() * 0.3,
				duration: 0.8 + Math.random() * 0.4,
			}));
			setPieces(newPieces);
			const timer = setTimeout(() => setPieces([]), 1500);
			return () => clearTimeout(timer);
		}
	}, [show]);

	if (pieces.length === 0) return null;

	return (
		<div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
			{pieces.map((piece) => (
				<div
					key={piece.id}
					className="absolute w-2 h-2 rounded-sm animate-confetti"
					style={{
						left: `${piece.left}%`,
						top: '50%',
						backgroundColor: piece.color,
						animationDelay: `${piece.delay}s`,
						animationDuration: `${piece.duration}s`,
					}}
				/>
			))}
		</div>
	);
};

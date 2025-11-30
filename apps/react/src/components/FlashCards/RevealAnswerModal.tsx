import React from 'react';
import { Modal } from '../modals/Modal';
import { MusicNotation } from '../MusicNotation';
import { Button } from '../ui/Button';
import { AnswerType, Card, CardTypeEnum, ChordMemoryAnswer } from 'MemoryFlashCore/src/types/Cards';

export const canRevealAnswer = (card: Card): boolean => {
	if (card.type !== CardTypeEnum.MultiSheet) return false;
	const hasTextPrompt = card.question.presentationModes?.some((m) => m.id === 'Text Prompt');
	return hasTextPrompt || card.answer.type === AnswerType.ChordMemory;
};

interface RevealAnswerModalProps {
	isOpen: boolean;
	onClose: () => void;
	card: Card;
}

const ChordMemoryReveal: React.FC<{ answer: ChordMemoryAnswer }> = ({ answer }) => (
	<div className="flex flex-wrap gap-4 justify-center">
		{answer.chords.map((chord, i) => (
			<div key={i} className="flex flex-col items-center gap-1">
				<span className="font-semibold">{chord.chordName}</span>
				<div className="flex gap-1">
					{chord.requiredTones.map((tone) => (
						<span
							key={tone}
							className="px-2 py-0.5 text-sm bg-blue-500 text-white rounded"
						>
							{tone}
						</span>
					))}
					{chord.optionalTones.map((tone) => (
						<span
							key={tone}
							className="px-2 py-0.5 text-sm bg-gray-300 text-gray-700 rounded"
						>
							{tone}
						</span>
					))}
				</div>
			</div>
		))}
	</div>
);

export const RevealAnswerModal: React.FC<RevealAnswerModalProps> = ({ isOpen, onClose, card }) => {
	if (card.type !== CardTypeEnum.MultiSheet) return null;

	const isChordMemory = card.answer.type === AnswerType.ChordMemory;
	const chordMemoryAnswer = isChordMemory ? (card.answer as ChordMemoryAnswer) : undefined;

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={isChordMemory ? 'Chord progression' : 'Original sheet music'}
		>
			<div className="p-6 space-y-4">
				<p className="text-sm text-gray-600">
					{isChordMemory
						? 'Play all blue tones (gray tones are optional).'
						: "Here's the sheet music you recorded when creating this prompt."}
				</p>
				<div className="flex justify-center">
					{chordMemoryAnswer ? (
						<ChordMemoryReveal answer={chordMemoryAnswer} />
					) : (
						<MusicNotation data={card.question} />
					)}
				</div>
				<Button onClick={onClose}>Close</Button>
			</div>
		</Modal>
	);
};
RevealAnswerModal.displayName = 'RevealAnswerModal';

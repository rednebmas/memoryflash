import React from 'react';
import { Modal } from '../modals/Modal';
import { MusicNotation } from '../MusicNotation';
import { Button } from '../Button';
import { MultiSheetCard } from 'MemoryFlashCore/src/types/MultiSheetCard';

interface RevealAnswerModalProps {
	isOpen: boolean;
	onClose: () => void;
	question: MultiSheetCard['question'];
}

export const RevealAnswerModal: React.FC<RevealAnswerModalProps> = ({
	isOpen,
	onClose,
	question,
}) => (
	<Modal isOpen={isOpen} onClose={onClose} title="Original sheet music">
		<div className="p-6 space-y-4">
			<p className="text-sm text-gray-600">
				Here’s the sheet music you recorded when creating this prompt.
			</p>
			<div className="flex justify-center">
				<MusicNotation data={question} />
			</div>
			<Button onClick={onClose}>Close</Button>
		</div>
	</Modal>
);
RevealAnswerModal.displayName = 'RevealAnswerModal';

import { TrashIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { deleteCard } from 'MemoryFlashCore/src/redux/actions/delete-card-action';
import { CardWithAttempts } from 'MemoryFlashCore/src/redux/selectors/currDeckCardsWithAttempts';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { CircleHover } from './CircleHover';
import { ConfirmModal } from './modals/ConfirmModal';

interface FlashCardDeleteButtonProps {
	card: CardWithAttempts;
	show?: boolean;
}

export const FlashCardDeleteButton: React.FC<FlashCardDeleteButtonProps> = ({ card, show }) => {
	const user = useAppSelector((s) => s.auth.user);
	const dispatch = useAppDispatch();
	const [open, setOpen] = React.useState(false);
	if (!show || !user || (card as any).userId !== user._id) return null;
	return (
		<>
			<div className="absolute right-1 bottom-1">
				<CircleHover onClick={() => setOpen(true)}>
					<TrashIcon className="w-4 h-4" />
				</CircleHover>
			</div>
			<ConfirmModal
				isOpen={open}
				onClose={() => setOpen(false)}
				message="Delete this card?"
				onConfirm={() => dispatch(deleteCard(card._id))}
			/>
		</>
	);
};

import { TrashIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { deleteCard } from 'MemoryFlashCore/src/redux/actions/delete-card-action';
import { CardWithAttempts } from 'MemoryFlashCore/src/redux/selectors/currDeckCardsWithAttempts';
import { useAppDispatch } from 'MemoryFlashCore/src/redux/store';
import { useIsCardOwner } from '../utils/useIsCardOwner';
import { CircleHover } from './CircleHover';
import { ConfirmModal } from './modals/ConfirmModal';

interface FlashCardDeleteButtonProps {
	card: CardWithAttempts;
	show?: boolean;
}

export const FlashCardDeleteButton: React.FC<FlashCardDeleteButtonProps> = ({ card, show }) => {
	const isOwner = useIsCardOwner(card);
	const dispatch = useAppDispatch();
	const [open, setOpen] = React.useState(false);
	if (!show || !isOwner) return null;
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

import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { Menu, MenuButton } from '@headlessui/react';
import { DropdownMenu, DropdownItem } from './DropdownMenu';
import { CircleHover } from './ui/CircleHover';
import { ConfirmModal } from './modals/ConfirmModal';
import { useNavigate } from 'react-router-dom';
import { useIsCardOwner } from '../utils/useIsCardOwner';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { updateHiddenCards } from 'MemoryFlashCore/src/redux/actions/update-hidden-cards-action';
import { deleteCard } from 'MemoryFlashCore/src/redux/actions/delete-card-action';
import {
	CardWithAttempts,
	selectHiddenCardIds,
} from 'MemoryFlashCore/src/redux/selectors/currDeckCardsWithAttempts';
import { RevealAnswerModal, canRevealAnswer } from './FlashCards/RevealAnswerModal';

interface FlashCardOptionsMenuProps {
	card: CardWithAttempts;
	showEdit?: boolean;
	showDelete?: boolean;
}

export const FlashCardOptionsMenu: React.FC<FlashCardOptionsMenuProps> = ({
	card,
	showEdit,
	showDelete,
}) => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const isOwner = useIsCardOwner(card);
	const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
	const [showAnswer, setShowAnswer] = React.useState(false);

	const hiddenIds = useAppSelector((state) => selectHiddenCardIds(state, card.deckId));
	const hidden = card.hidden ?? hiddenIds.includes(card._id);
	const canReveal = canRevealAnswer(card);
	const toggleHidden = () => {
		const updated = hidden
			? hiddenIds.filter((id) => id !== card._id)
			: [...hiddenIds, card._id];
		dispatch(updateHiddenCards(card.deckId, updated));
	};

	const items: DropdownItem[] = [
		{
			label: hidden ? 'Unhide card' : 'Hide card',
			onClick: toggleHidden,
		},
	];

	if (canReveal) {
		items.unshift({
			label: 'Reveal answer',
			onClick: () => setShowAnswer(true),
		});
	}

	if (isOwner && showEdit) {
		items.push({
			label: 'Edit card',
			onClick: () => navigate(`/study/${card.deckId}/edit/${card._id}`),
		});
	}

	if (isOwner && showDelete) {
		items.push({
			label: 'Delete card',
			onClick: () => setIsDeleteOpen(true),
		});
	}

	return (
		<>
			<Menu as="div" className="relative inline-block text-left">
				<MenuButton className="focus:outline-none" aria-label="Card options">
					<CircleHover>
						<EllipsisVerticalIcon className="w-5 h-5" />
					</CircleHover>
				</MenuButton>
				<DropdownMenu items={items} />
			</Menu>
			<ConfirmModal
				isOpen={isDeleteOpen}
				onClose={() => setIsDeleteOpen(false)}
				message="Delete this card?"
				onConfirm={() => dispatch(deleteCard(card._id))}
			/>
			{canReveal && (
				<RevealAnswerModal
					isOpen={showAnswer}
					onClose={() => setShowAnswer(false)}
					card={card}
				/>
			)}
		</>
	);
};

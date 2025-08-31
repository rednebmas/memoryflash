import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { CardWithAttempts } from 'MemoryFlashCore/src/redux/selectors/currDeckCardsWithAttempts';
import { useIsCardOwner } from '../utils/useIsCardOwner';
import { CircleHover } from './CircleHover';

interface FlashCardEditButtonProps {
	card: CardWithAttempts;
	show?: boolean;
}

export const FlashCardEditButton: React.FC<FlashCardEditButtonProps> = ({ card, show }) => {
	const isOwner = useIsCardOwner(card);
	if (!show || !isOwner) return null;

	return (
		<div className="absolute right-1 top-1">
			<CircleHover link={`/study/${card.deckId}/edit/${card._id}`}>
				<PencilSquareIcon className="w-4 h-4" />
			</CircleHover>
		</div>
	);
};

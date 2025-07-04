import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { CardWithAttempts } from 'MemoryFlashCore/src/redux/selectors/currDeckCardsWithAttempts';
import { CircleHover } from './CircleHover';

interface FlashCardEditButtonProps {
	card: CardWithAttempts;
	show?: boolean;
}

export const FlashCardEditButton: React.FC<FlashCardEditButtonProps> = ({ card, show }) => {
	const user = useAppSelector((state) => state.auth.user);

	if (!show || !user || (card as any).userId !== user._id) return null;

	return (
		<div className="absolute right-1 top-1">
			<CircleHover link={`/study/${card.deckId}/edit/${card._id}`}>
				<PencilSquareIcon className="w-4 h-4" />
			</CircleHover>
		</div>
	);
};

import React from 'react';
import { CardWithAttempts } from 'MemoryFlashCore/src/redux/selectors/currDeckCardsWithAttempts';
import { User } from 'MemoryFlashCore/src/types/User';
import { isCardOwner } from '../utils/useIsCardOwner';
import { FlashCard } from './FlashCard';

interface FadingCardProps {
	card?: CardWithAttempts;
	index: number;
	user?: User | null;
}

export const FadingCard: React.FC<FadingCardProps> = ({ card, index, user }) => {
	if (!card) return null;
	const isOwner = isCardOwner(card, user ?? undefined);
	return (
		<div className="flex flex-1 justify-center items-center">
			<FlashCard
				key={card._id + index}
				placement="cur"
				card={card}
				className="card-shadow-2 animate-card-fade"
				showEdit={isOwner}
				showDelete={isOwner}
			/>
		</div>
	);
};

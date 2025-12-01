import { PresentationChartLineIcon } from '@heroicons/react/24/outline';
import React, { useEffect } from 'react';
import { FlashCard, Layout } from '../components';
import { NetworkStateWrapper } from '../components/feedback/NetworkStateWrapper';
import { CircleHover } from '../components/ui/CircleHover';
import { getDeck } from 'MemoryFlashCore/src/redux/actions/get-deck-action';
import { currDeckAllWithCorrectAttemptsSortedArray } from 'MemoryFlashCore/src/redux/selectors/currDeckCardsWithAttempts';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { useDeckIdPath } from './useDeckIdPath';

interface AllDeckCardsScreenProps {}

export const AllDeckCardsScreen: React.FunctionComponent<AllDeckCardsScreenProps> = ({}) => {
	const dispatch = useAppDispatch();
	const { deckId } = useDeckIdPath();
	const deck = useAppSelector(currDeckAllWithCorrectAttemptsSortedArray);

	useEffect(() => {
		if (deckId) {
			dispatch(getDeck(deckId));
		}
	}, [deckId]);

	if (!deck) {
		return null;
	}

	return (
		<Layout
			right={
				<CircleHover link={`/study/${deckId}/stats`}>
					<PresentationChartLineIcon className="w-5 h-5 stroke-2" />
				</CircleHover>
			}
		>
			<NetworkStateWrapper networkKey={`getDeck${deckId}`} hasData={deck.length > 0}>
				<div className="flex flex-col items-center">
					<div className="mb-4">{deck.length} cards</div>
					{deck.map((card, i) => (
						<FlashCard
							key={card._id + i}
							placement="cur"
							card={card}
							className="card-shadow-2"
							opacity={card.hidden ? 0.5 : 1}
							showEdit
							showDelete
						/>
					))}
				</div>
			</NetworkStateWrapper>
		</Layout>
	);
};

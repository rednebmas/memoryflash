import { PresentationChartLineIcon } from '@heroicons/react/24/outline';
import React, { useEffect } from 'react';
import { FlashCard, Layout } from '../components';
import { BasicErrorCard } from '../components/feedback/ErrorCard';
import { Spinner } from '../components/feedback/Spinner';
import { CircleHover } from '../components/ui/CircleHover';
import { getDeck } from 'MemoryFlashCore/src/redux/actions/get-deck-action';
import { currDeckAllWithCorrectAttemptsSortedArray } from 'MemoryFlashCore/src/redux/selectors/currDeckCardsWithAttempts';
import { useNetworkState } from 'MemoryFlashCore/src/redux/selectors/useNetworkState';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { useDeckIdPath } from './useDeckIdPath';

interface AllDeckCardsScreenProps {}

export const AllDeckCardsScreen: React.FunctionComponent<AllDeckCardsScreenProps> = ({}) => {
	const dispatch = useAppDispatch();
	const { deckId } = useDeckIdPath();
	const deck = useAppSelector(currDeckAllWithCorrectAttemptsSortedArray);

	const { isLoading, error } = useNetworkState('getDeck' + deckId);

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
			<Spinner show={isLoading && deck.length === 0} />
			<BasicErrorCard error={error} />
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
		</Layout>
	);
};

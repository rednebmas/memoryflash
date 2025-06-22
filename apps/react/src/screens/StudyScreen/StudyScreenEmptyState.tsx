import { Link } from 'react-router-dom';
import { Button } from '../../components/Button';
import { BasicErrorCard } from '../../components/ErrorCard';
import { Spinner } from '../../components/Spinner';
import { useDeckIdPath } from '../useDeckIdPath';
import { useNetworkState } from 'MemoryFlashCore/src/redux/selectors/useNetworkState';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { sessionCardsSelector } from 'MemoryFlashCore/src/redux/selectors/scheduledCardsSelector';

export const StudyScreenEmptyState: React.FC = () => {
	const { deckId, deck } = useDeckIdPath();
	const { cards } = useAppSelector(sessionCardsSelector);
	const { isLoading, error } = useNetworkState('getDeck' + deckId);
	const course = useAppSelector((state) =>
		deck?.courseId ? state.courses.entities[deck.courseId] : undefined,
	);
	const user = useAppSelector((state) => state.auth.user);
	const isOwner = !!(course && user && course.userId === user._id);

	if (cards.length > 0) return null;
	return (
		<>
			<Spinner show={isLoading} />
			<BasicErrorCard error={error} />
			{!isLoading &&
				(isOwner ? (
					<Link to={`/study/${deckId}/notation`} className="w-full flex justify-center">
						<Button className="w-48">Add Cards</Button>
					</Link>
				) : (
					<div className="text-center text-gray-500 w-full">This deck has no cards.</div>
				))}
		</>
	);
};

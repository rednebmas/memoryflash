import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { NetworkStateWrapper } from '../../components/feedback/NetworkStateWrapper';
import { useDeckIdPath } from '../useDeckIdPath';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { sessionCardsSelector } from 'MemoryFlashCore/src/redux/selectors/scheduledCardsSelector';

export const StudyScreenEmptyState: React.FC = () => {
	const { deckId, deck } = useDeckIdPath();
	const { cards } = useAppSelector(sessionCardsSelector);
	const course = useAppSelector((state) =>
		deck?.courseId ? state.courses.entities[deck.courseId] : undefined,
	);
	const user = useAppSelector((state) => state.auth.user);
	const isOwner = !!(course && user && course.userId === user._id);

	if (cards.length > 0) return null;
	return (
		<NetworkStateWrapper networkKey={`getDeck${deckId}`} hasData={false}>
			{isOwner ? (
				<Link to={`/study/${deckId}/notation`} className="w-full flex justify-center">
					<Button className="w-auto px-6">Add Cards</Button>
				</Link>
			) : (
				<div className="text-center text-gray-500 w-full">This deck has no cards.</div>
			)}
		</NetworkStateWrapper>
	);
};

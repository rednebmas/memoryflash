import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
	Layout,
	SectionHeader,
	ListContainer,
	SegmentedControl,
	SegmentButton,
	EmptyState,
} from '../components';
import { BasicErrorCard } from '../components/feedback/ErrorCard';
import { Spinner } from '../components/feedback/Spinner';
import { SearchInput } from '../components/inputs';
import {
	searchCommunityDecks,
	searchCommunityCourses,
	getLeaderboard,
} from 'MemoryFlashCore/src/redux/actions/community-actions';
import { useNetworkState } from 'MemoryFlashCore/src/redux/selectors/useNetworkState';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';

type Tab = 'decks' | 'courses';

export const CommunityScreen: React.FC = () => {
	const dispatch = useAppDispatch();
	const [activeTab, setActiveTab] = useState<Tab>('decks');
	const [searchQuery, setSearchQuery] = useState('');
	const [debouncedQuery, setDebouncedQuery] = useState('');

	const deckResults = useAppSelector((state) => state.community.deckResults);
	const courseResults = useAppSelector((state) => state.community.courseResults);
	const leaderboard = useAppSelector((state) => state.community.leaderboard);

	const { isLoading: isLoadingDecks, error: decksError } =
		useNetworkState('searchCommunityDecks');
	const { isLoading: isLoadingCourses, error: coursesError } =
		useNetworkState('searchCommunityCourses');
	const { isLoading: isLoadingLeaderboard } = useNetworkState('getLeaderboard');

	useEffect(() => {
		dispatch(getLeaderboard());
	}, [dispatch]);

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedQuery(searchQuery);
		}, 300);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	useEffect(() => {
		if (activeTab === 'decks') {
			dispatch(searchCommunityDecks(debouncedQuery));
		} else {
			dispatch(searchCommunityCourses(debouncedQuery));
		}
	}, [dispatch, activeTab, debouncedQuery]);

	const handleTabChange = useCallback((tab: Tab) => {
		setActiveTab(tab);
	}, []);

	const isLoading = activeTab === 'decks' ? isLoadingDecks : isLoadingCourses;
	const error = activeTab === 'decks' ? decksError : coursesError;

	return (
		<Layout subtitle="Community">
			<div className="space-y-6">
				{leaderboard.length > 0 && (
					<div>
						<SectionHeader title="Top Decks" />
						<ListContainer>
							{isLoadingLeaderboard ? (
								<Spinner show />
							) : (
								leaderboard.slice(0, 5).map((entry, index) => (
									<Link
										key={entry.deckId}
										to={`/deck/${entry.deckId}/preview`}
										className="flex items-center justify-between p-4 hover:bg-gray-50"
									>
										<div className="flex items-center gap-3">
											<span className="text-lg font-medium text-gray-400 w-6">
												{index + 1}
											</span>
											<div>
												<div className="font-medium text-gray-900">
													{entry.deckName}
												</div>
												{entry.courseName && (
													<div className="text-sm text-gray-500">
														{entry.courseName}
													</div>
												)}
											</div>
										</div>
										<span className="text-sm text-gray-500">
											{entry.attemptCount} attempts
										</span>
									</Link>
								))
							)}
						</ListContainer>
					</div>
				)}

				<div>
					<SectionHeader title="Browse" />
					<div className="space-y-4">
						<SegmentedControl>
							<SegmentButton
								text="Decks"
								active={activeTab === 'decks'}
								onClick={() => handleTabChange('decks')}
							/>
							<SegmentButton
								text="Courses"
								active={activeTab === 'courses'}
								onClick={() => handleTabChange('courses')}
							/>
						</SegmentedControl>

						<SearchInput
							placeholder={`Search ${activeTab}...`}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>

						<BasicErrorCard error={error} />

						{isLoading ? (
							<Spinner show />
						) : activeTab === 'decks' ? (
							<DeckResultsList decks={deckResults} />
						) : (
							<CourseResultsList courses={courseResults} />
						)}
					</div>
				</div>
			</div>
		</Layout>
	);
};

interface DeckResultsListProps {
	decks: { _id: string; name: string; course: string | null }[];
}

const DeckResultsList: React.FC<DeckResultsListProps> = ({ decks }) => {
	if (decks.length === 0) {
		return <EmptyState message="No decks found" />;
	}

	return (
		<ListContainer>
			{decks.map((deck) => (
				<Link
					key={deck._id}
					to={`/deck/${deck._id}/preview`}
					className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
				>
					<div>
						<div className="font-medium text-gray-900 dark:text-gray-100">
							{deck.name}
						</div>
						{deck.course && <div className="text-sm text-gray-500">{deck.course}</div>}
					</div>
				</Link>
			))}
		</ListContainer>
	);
};

interface CourseResultsListProps {
	courses: { _id: string; name: string; deckCount: number; totalCardCount: number }[];
}

const CourseResultsList: React.FC<CourseResultsListProps> = ({ courses }) => {
	if (courses.length === 0) {
		return <EmptyState message="No courses found" />;
	}

	return (
		<ListContainer>
			{courses.map((course) => (
				<Link
					key={course._id}
					to={`/course/${course._id}/preview`}
					className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
				>
					<div className="font-medium text-gray-900 dark:text-gray-100">
						{course.name}
					</div>
					<span className="text-sm text-gray-500">
						{course.deckCount} {course.deckCount === 1 ? 'deck' : 'decks'} •{' '}
						{course.totalCardCount} {course.totalCardCount === 1 ? 'card' : 'cards'}
					</span>
				</Link>
			))}
		</ListContainer>
	);
};

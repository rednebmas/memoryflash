import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Layout, SectionHeader } from '../components';
import { SegmentButton } from '../components/SegmentButton';
import { BasicErrorCard } from '../components/ErrorCard';
import { Spinner } from '../components/Spinner';
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
						<div className="bg-white rounded-lg shadow divide-y divide-gray-100">
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
						</div>
					</div>
				)}

				<div>
					<SectionHeader title="Browse" />
					<div className="space-y-4">
						<div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
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
						</div>

						<input
							type="text"
							placeholder={`Search ${activeTab}...`}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm"
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
		return <p className="text-center text-gray-500 py-8">No decks found</p>;
	}

	return (
		<div className="bg-white rounded-lg shadow divide-y divide-gray-100">
			{decks.map((deck) => (
				<Link
					key={deck._id}
					to={`/deck/${deck._id}/preview`}
					className="flex items-center justify-between p-4 hover:bg-gray-50"
				>
					<div>
						<div className="font-medium text-gray-900">{deck.name}</div>
						{deck.course && <div className="text-sm text-gray-500">{deck.course}</div>}
					</div>
				</Link>
			))}
		</div>
	);
};

interface CourseResultsListProps {
	courses: { _id: string; name: string; deckCount: number; totalCardCount: number }[];
}

const CourseResultsList: React.FC<CourseResultsListProps> = ({ courses }) => {
	if (courses.length === 0) {
		return <p className="text-center text-gray-500 py-8">No courses found</p>;
	}

	return (
		<div className="bg-white rounded-lg shadow divide-y divide-gray-100">
			{courses.map((course) => (
				<Link
					key={course._id}
					to={`/course/${course._id}/preview`}
					className="flex items-center justify-between p-4 hover:bg-gray-50"
				>
					<div className="font-medium text-gray-900">{course.name}</div>
					<span className="text-sm text-gray-500">
						{course.deckCount} {course.deckCount === 1 ? 'deck' : 'decks'} •{' '}
						{course.totalCardCount} {course.totalCardCount === 1 ? 'card' : 'cards'}
					</span>
				</Link>
			))}
		</div>
	);
};

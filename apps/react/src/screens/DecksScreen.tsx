import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, SectionData, SectionHeader } from '../components';
import { BasicErrorCard } from '../components/ErrorCard';
import { Spinner } from '../components/Spinner';
import { Button } from '../components/Button';
import { PlusIcon } from '@heroicons/react/24/solid';
import { getCourse } from 'MemoryFlashCore/src/redux/actions/get-course-action';
import { decksSelector } from 'MemoryFlashCore/src/redux/selectors/decksSelector';
import { useNetworkState } from 'MemoryFlashCore/src/redux/selectors/useNetworkState';
import { coursesActions } from 'MemoryFlashCore/src/redux/slices/coursesSlice';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';

export const DecksScreen = () => {
	const dispatch = useAppDispatch();
	const { courseId } = useParams();
	const navigate = useNavigate();
	const { course, parsingCourseId } = useAppSelector((state) => {
		if (state.courses.parsingCourse) {
			return {
				course: state.courses.entities[state.courses.parsingCourse],
				parsingCourseId: state.courses.parsingCourse,
			};
		}
		return {
			course: undefined,
			parsingCourseId: state.courses.parsingCourse,
		};
	});
	const decks = useSelector(decksSelector);
	const { isLoading, error } = useNetworkState('getCourse' + parsingCourseId);

	if (courseId && parsingCourseId != courseId) {
		dispatch(coursesActions.setParsingCourse(courseId));
	}

	useEffect(() => {
		if (parsingCourseId) {
			dispatch(getCourse(parsingCourseId));
		}
	}, [parsingCourseId]);

	const handleCreateDeck = () => {
		if (courseId) {
			navigate(`/course/${courseId}/create-deck`);
		}
	};

	return (
		<Layout subtitle={course?.name} back="/">
			<div className="space-y-6">
				<div>
					<Spinner show={isLoading && Object.keys(decks).length === 0} />
					<BasicErrorCard error={error} />
					{Object.keys(decks).map((section) => {
						return (
							<div key={section} className="space-y-4 mb-6">
								<SectionHeader title={decks[section][0].section} />
								<SectionData
									btnText="Study"
									items={decks[section].map((deck) => {
										return {
											title: deck.name,
											link: `/study/${deck._id}`,
											subTitle:
												deck.stats &&
												`Median: ${deck.stats?.medianTimeTaken.toFixed(1)}`,
										};
									})}
								/>
							</div>
						);
					})}
				</div>

				{/* Only show the create deck button if this is the user's course */}
				{course?.userId && (
					<div className="mt-6 flex justify-center">
						<Button
							onClick={handleCreateDeck}
							icon={<PlusIcon className="h-5 w-5" />}
						>
							Create Deck
						</Button>
					</div>
				)}
			</div>
		</Layout>
	);
};

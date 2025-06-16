import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { Layout, SectionData, SectionHeader, Button } from '../components';
import { BasicErrorCard } from '../components/ErrorCard';
import { Spinner } from '../components/Spinner';
import { getCourse } from 'MemoryFlashCore/src/redux/actions/get-course-action';
import { decksSelector } from 'MemoryFlashCore/src/redux/selectors/decksSelector';
import { useNetworkState } from 'MemoryFlashCore/src/redux/selectors/useNetworkState';
import { coursesActions } from 'MemoryFlashCore/src/redux/slices/coursesSlice';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';

export const DecksScreen = () => {
	const dispatch = useAppDispatch();
	const { courseId } = useParams();
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
	const user = useAppSelector((state) => state.auth.user);
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

	return (
		<Layout subtitle={course?.name} back="/">
			<Spinner show={isLoading && Object.keys(decks).length === 0} />
			<BasicErrorCard error={error} />
			{Object.keys(decks).map((section) => {
				return (
					<div key={section} className="space-y-4">
						<SectionHeader title={decks[section][0].section} />
						<SectionData
							btnText="Lessons"
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
			{course && user && (course as any).userId === user._id && (
				<div className="pt-4 flex justify-center">
					<Link to="/notation" className="w-48">
						<Button>Create Deck</Button>
					</Link>
				</div>
			)}
		</Layout>
	);
};

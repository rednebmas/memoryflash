import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Layout, SectionData, SectionHeader, TextFieldModal, Button } from '../components';
import { BasicErrorCard } from '../components/ErrorCard';
import { Spinner } from '../components/Spinner';
import { getCourse } from 'MemoryFlashCore/src/redux/actions/get-course-action';
import { createDeck } from 'MemoryFlashCore/src/redux/actions/create-deck-action';
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
	const decks = useSelector(decksSelector);
	const { isLoading, error } = useNetworkState('getCourse' + parsingCourseId);
	const [showCreate, setShowCreate] = useState(false);

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
			<div className="flex justify-end mb-2">
				<Button className="px-3 py-1 text-sm" onClick={() => setShowCreate(true)}>
					Create Deck
				</Button>
			</div>
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
			<TextFieldModal
				isOpen={showCreate}
				onClose={() => setShowCreate(false)}
				title="Create Deck"
				initialValue=""
				onSave={(name) => {
					setShowCreate(false);
					if (parsingCourseId) {
						dispatch(createDeck(parsingCourseId, name));
					}
				}}
			/>
		</Layout>
	);
};

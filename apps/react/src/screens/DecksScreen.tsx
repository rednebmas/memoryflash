import React, { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
	Layout,
	SectionData,
	SectionHeader,
	Button,
	InputModal,
	CardOptionsMenu,
} from '../components';
import { BasicErrorCard } from '../components/ErrorCard';
import { Spinner } from '../components/Spinner';
import { getCourse } from 'MemoryFlashCore/src/redux/actions/get-course-action';
import { decksSelector } from 'MemoryFlashCore/src/redux/selectors/decksSelector';
import { useNetworkState } from 'MemoryFlashCore/src/redux/selectors/useNetworkState';
import { coursesActions } from 'MemoryFlashCore/src/redux/slices/coursesSlice';
import { createDeck } from 'MemoryFlashCore/src/redux/actions/create-deck-action';
import { renameDeck } from 'MemoryFlashCore/src/redux/actions/rename-deck-action';
import { deleteDeck } from 'MemoryFlashCore/src/redux/actions/delete-deck-action';
import { updateDeckVisibility } from 'MemoryFlashCore/src/redux/actions/update-deck-visibility-action';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { Visibility } from 'MemoryFlashCore/src/types/Deck';

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
	const navigate = useNavigate();
	const user = useAppSelector((state) => state.auth.user);
	const [isCreateOpen, setIsCreateOpen] = React.useState(false);
	const decks = useSelector(decksSelector);
	const { isLoading, error } = useNetworkState('getCourse' + parsingCourseId);

	const disabledVisibilityOptions = useMemo(():
		| Partial<Record<Visibility, string>>
		| undefined => {
		if (course?.visibility === 'public') {
			return {
				private: 'Decks in a public course must be public',
				unlisted: 'Decks in a public course must be public',
			};
		}
		if (course?.visibility === 'unlisted') {
			return {
				private: 'Decks in an unlisted course cannot be private',
			};
		}
		return undefined;
	}, [course?.visibility]);

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
							btnText="Study"
							items={decks[section].map((deck) => {
								return {
									title: deck.name,
									link: `/study/${deck._id}`,
									subTitle:
										deck.stats &&
										`Median: ${deck.stats?.medianTimeTaken.toFixed(1)}`,
									menu:
										course && user && course.userId === user._id ? (
											<CardOptionsMenu
												itemName={deck.name}
												renameLabel="Deck name"
												confirmMessage="Are you sure you want to delete this deck?"
												onRename={(val) =>
													dispatch(renameDeck(String(deck._id), val))
												}
												onDelete={() =>
													dispatch(deleteDeck(String(deck._id)))
												}
												visibility={deck.visibility ?? 'private'}
												onVisibilityChange={(v) =>
													dispatch(
														updateDeckVisibility(String(deck._id), v),
													)
												}
												disabledVisibilityOptions={
													disabledVisibilityOptions
												}
											/>
										) : undefined,
								};
							})}
						/>
					</div>
				);
			})}
			{course && user && course.userId === user._id && (
				<>
					<div className="pt-4 flex justify-center">
						<Button className="w-48" onClick={() => setIsCreateOpen(true)}>
							Create Deck
						</Button>
					</div>
					<InputModal
						isOpen={isCreateOpen}
						onClose={() => setIsCreateOpen(false)}
						label="Deck name"
						onSave={(val) => {
							dispatch(
								createDeck(course._id, val, {
									successCb: (deck) => navigate(`/study/${deck._id}/notation`),
								}),
							);
						}}
					/>
				</>
			)}
		</Layout>
	);
};

import { createCourse } from 'MemoryFlashCore/src/redux/actions/create-course-action';
import { deleteCourse } from 'MemoryFlashCore/src/redux/actions/delete-course-action';
import { getCourses } from 'MemoryFlashCore/src/redux/actions/get-courses-action';
import { getFeed } from 'MemoryFlashCore/src/redux/actions/get-feed-action';
import { renameCourse } from 'MemoryFlashCore/src/redux/actions/rename-course-action';
import { updateCourseVisibility } from 'MemoryFlashCore/src/redux/actions/update-course-visibility-action';
import { coursesSelector } from 'MemoryFlashCore/src/redux/selectors/coursesSelector';
import { recentDeckFeedItemsSelector } from 'MemoryFlashCore/src/redux/selectors/feedSelectors';
import { useNetworkState } from 'MemoryFlashCore/src/redux/selectors/useNetworkState';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { Visibility, VISIBILITY_LEVEL } from 'MemoryFlashCore/src/types/Deck';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
	Button,
	CardOptionsMenu,
	InputModal,
	Layout,
	SectionData,
	SectionHeader,
} from '../components';
import { BasicErrorCard } from '../components/ErrorCard';
import { Spinner } from '../components/Spinner';

const getVisibilityWarnings = (
	currentVisibility: Visibility,
): Partial<Record<Visibility, string>> => {
	const warnings: Partial<Record<Visibility, string>> = {};
	const currentLevel = VISIBILITY_LEVEL[currentVisibility];
	if (currentLevel < VISIBILITY_LEVEL['unlisted']) {
		warnings['unlisted'] = 'All private decks in this course will become unlisted.';
	}
	if (currentLevel < VISIBILITY_LEVEL['public']) {
		warnings['public'] = 'All decks in this course will become public.';
	}
	return warnings;
};

export const CoursesScreen = () => {
	const dispatch = useAppDispatch();
	const courses = useSelector(coursesSelector);
	const user = useAppSelector((state) => state.auth.user);
	const { isLoading, error } = useNetworkState('getCourses');
	const { isLoading: isFeedLoading, error: feedError } = useNetworkState('getFeed');
	const [isCreateOpen, setIsCreateOpen] = React.useState(false);
	const recentDecks = useAppSelector(recentDeckFeedItemsSelector);
	useEffect(() => {
		dispatch(getCourses());
		dispatch(getFeed());
	}, [dispatch]);

	return (
		<Layout>
			<div className="space-y-4">
				<Spinner show={isFeedLoading && recentDecks.length === 0} />
				<BasicErrorCard error={error || feedError} />
				{recentDecks.length > 0 && (
					<>
						<SectionHeader title="Most recently played decks" />
						<SectionData btnText="Study" items={recentDecks} />
					</>
				)}
				<SectionHeader title="Courses" />
				<Spinner show={isLoading && courses.length === 0} />
				<SectionData
					btnText="Lessons"
					items={courses.map((course) => {
						const courseVisibility = course.visibility ?? 'private';
						return {
							title: course.name,
							link: `/course/${course._id}`,
							menu:
								user && course.userId === user._id ? (
									<CardOptionsMenu
										itemName={course.name}
										onRename={(val) => dispatch(renameCourse(course._id, val))}
										onDelete={() => dispatch(deleteCourse(course._id))}
										confirmMessage="Are you sure you want to delete this course?"
										visibility={courseVisibility}
										onVisibilityChange={(v) =>
											dispatch(updateCourseVisibility(course._id, v))
										}
										warningVisibilityOptions={getVisibilityWarnings(
											courseVisibility,
										)}
									/>
								) : undefined,
						};
					})}
				/>
				<div className="pt-4 flex justify-center">
					<Button className="w-48" onClick={() => setIsCreateOpen(true)}>
						Create Course
					</Button>
				</div>
				<InputModal
					isOpen={isCreateOpen}
					onClose={() => setIsCreateOpen(false)}
					label="Course name"
					onSave={(val) => dispatch(createCourse(val))}
				/>
			</div>
		</Layout>
	);
};

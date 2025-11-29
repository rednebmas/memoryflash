import { PresentationChartLineIcon } from '@heroicons/react/24/outline';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
	Layout,
	SectionData,
	SectionHeader,
	Button,
	InputModal,
	CardOptionsMenu,
} from '../components';
import { CircleHover } from '../components/CircleHover';
import { BasicErrorCard } from '../components/ErrorCard';
import { MidiInputsDropdown } from '../components/MidiInputsDropdown';
import { Spinner } from '../components/Spinner';
import { getCourses } from 'MemoryFlashCore/src/redux/actions/get-courses-action';
import { createCourse } from 'MemoryFlashCore/src/redux/actions/create-course-action';
import { renameCourse } from 'MemoryFlashCore/src/redux/actions/rename-course-action';
import { coursesSelector } from 'MemoryFlashCore/src/redux/selectors/coursesSelector';
import { useNetworkState } from 'MemoryFlashCore/src/redux/selectors/useNetworkState';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { deleteCourse } from 'MemoryFlashCore/src/redux/actions/delete-course-action';
import { getFeed } from 'MemoryFlashCore/src/redux/actions/get-feed-action';
import { recentDeckFeedItemsSelector } from 'MemoryFlashCore/src/redux/selectors/feedSelectors';
import { updateCourseVisibility } from 'MemoryFlashCore/src/redux/actions/update-course-visibility-action';

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
										visibility={course.visibility ?? 'private'}
										onVisibilityChange={(v) =>
											dispatch(updateCourseVisibility(course._id, v))
										}
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

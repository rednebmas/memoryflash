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
	ConfirmModal,
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

export const CoursesScreen = () => {
	const dispatch = useAppDispatch();
	const courses = useSelector(coursesSelector);
	const user = useAppSelector((state) => state.auth.user);
	const { isLoading, error } = useNetworkState('getCourses');
	const [isCreateOpen, setIsCreateOpen] = React.useState(false);
	const [renameCourseId, setRenameCourseId] = React.useState<string | undefined>();
	const [deleteCourseId, setDeleteCourseId] = React.useState<string | undefined>();
	useEffect(() => {
		dispatch(getCourses());
	}, []);

	return (
		<Layout>
			<div className="space-y-4">
				<SectionHeader title="Courses" />
				<Spinner show={isLoading && courses.length === 0} />
				<BasicErrorCard error={error} />
				<SectionData
					btnText="Lessons"
					items={courses.map((course) => {
						return {
							title: course.name,
							link: `/course/${course._id}`,
							menu:
								user && course.userId === user._id ? (
									<CardOptionsMenu
										onRename={() => setRenameCourseId(course._id)}
										onDelete={() => setDeleteCourseId(course._id)}
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
				<InputModal
					isOpen={!!renameCourseId}
					onClose={() => setRenameCourseId(undefined)}
					label="Course name"
					value={courses.find((c) => c._id === renameCourseId)?.name}
					onSave={(val) => renameCourseId && dispatch(renameCourse(renameCourseId, val))}
				/>
				<ConfirmModal
					isOpen={!!deleteCourseId}
					onClose={() => setDeleteCourseId(undefined)}
					message="Are you sure you want to delete this course?"
					onConfirm={() => {
						if (deleteCourseId) dispatch(deleteCourse(deleteCourseId));
					}}
				/>
			</div>
		</Layout>
	);
};

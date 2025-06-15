import { PresentationChartLineIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Layout, SectionData, SectionHeader, TextFieldModal, Button } from '../components';
import { CircleHover } from '../components/CircleHover';
import { BasicErrorCard } from '../components/ErrorCard';
import { MidiInputsDropdown } from '../components/MidiInputsDropdown';
import { Spinner } from '../components/Spinner';
import { getCourses } from 'MemoryFlashCore/src/redux/actions/get-courses-action';
import { createCourse } from 'MemoryFlashCore/src/redux/actions/create-course-action';
import { coursesSelector } from 'MemoryFlashCore/src/redux/selectors/coursesSelector';
import { useNetworkState } from 'MemoryFlashCore/src/redux/selectors/useNetworkState';
import { useAppDispatch } from 'MemoryFlashCore/src/redux/store';

export const CoursesScreen = () => {
	const dispatch = useAppDispatch();
	const courses = useSelector(coursesSelector);
	const { isLoading, error } = useNetworkState('getCourses');
	const [showCreate, setShowCreate] = useState(false);

	useEffect(() => {
		dispatch(getCourses());
	}, []);

	return (
		<Layout>
			<div className="space-y-4">
				<div className="flex justify-between items-center">
					<SectionHeader title="Courses" />
					<Button className="px-3 py-1 text-sm" onClick={() => setShowCreate(true)}>
						Create
					</Button>
				</div>
				<Spinner show={isLoading && courses.length === 0} />
				<BasicErrorCard error={error} />
				<SectionData
					btnText="Lessons"
					items={courses.map((course) => {
						return {
							title: course.name,
							link: `/course/${course._id}`,
						};
					})}
				/>
			</div>
			<TextFieldModal
				isOpen={showCreate}
				onClose={() => setShowCreate(false)}
				title="Create Course"
				initialValue=""
				onSave={(name) => {
					setShowCreate(false);
					dispatch(createCourse(name));
				}}
			/>
		</Layout>
	);
};

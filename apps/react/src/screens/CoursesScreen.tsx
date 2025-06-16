import { PresentationChartLineIcon } from '@heroicons/react/24/outline';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Layout, SectionData, SectionHeader, Button, InputModal } from '../components';
import { CircleHover } from '../components/CircleHover';
import { BasicErrorCard } from '../components/ErrorCard';
import { MidiInputsDropdown } from '../components/MidiInputsDropdown';
import { Spinner } from '../components/Spinner';
import { getCourses } from 'MemoryFlashCore/src/redux/actions/get-courses-action';
import { coursesSelector } from 'MemoryFlashCore/src/redux/selectors/coursesSelector';
import { useNetworkState } from 'MemoryFlashCore/src/redux/selectors/useNetworkState';
import { useAppDispatch } from 'MemoryFlashCore/src/redux/store';

export const CoursesScreen = () => {
	const dispatch = useAppDispatch();
	const courses = useSelector(coursesSelector);
	const { isLoading, error } = useNetworkState('getCourses');
	const [isCreateOpen, setIsCreateOpen] = React.useState(false);
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
					onSave={(val) => console.log('Create course', val)}
				/>
			</div>
		</Layout>
	);
};

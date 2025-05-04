import { PlusIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Layout, SectionData, SectionHeader } from '../components';
import { BasicErrorCard } from '../components/ErrorCard';
import { Spinner } from '../components/Spinner';
import { Button } from '../components/Button';
import { CreateCourseModal } from '../components/modals/CreateCourseModal';
import { getCourses } from 'MemoryFlashCore/src/redux/actions/get-courses-action';
import { coursesSelector } from 'MemoryFlashCore/src/redux/selectors/coursesSelector';
import { useNetworkState } from 'MemoryFlashCore/src/redux/selectors/useNetworkState';
import { useAppDispatch } from 'MemoryFlashCore/src/redux/store';

export const CoursesScreen = () => {
	const dispatch = useAppDispatch();
	const courses = useSelector(coursesSelector);
	const { isLoading, error } = useNetworkState('getCourses');
	const [isCreateModalOpen, setCreateModalOpen] = useState(false);

	useEffect(() => {
		dispatch(getCourses());
	}, []);

	return (
		<Layout>
			<div className='space-y-6'>
				<div>
					<SectionHeader title='Courses' />
					<Spinner show={isLoading && courses.length === 0} />
					<BasicErrorCard error={error} />
					<SectionData
						btnText='Lessons'
						items={courses.map((course) => {
							return {
								title: course.name,
								link: `/course/${course._id}`,
							};
						})}
					/>
				</div>
				
				<div className='mt-6 flex justify-center'>
					<Button 
						onClick={() => setCreateModalOpen(true)}
						icon={<PlusIcon className='h-5 w-5' />}
					>
						Create Course
					</Button>
				</div>
			</div>

			<CreateCourseModal 
				isOpen={isCreateModalOpen}
				onClose={() => setCreateModalOpen(false)}
			/>
		</Layout>
	);
};

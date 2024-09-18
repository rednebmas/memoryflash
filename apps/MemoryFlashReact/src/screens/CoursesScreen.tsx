import { PresentationChartLineIcon } from '@heroicons/react/24/outline';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Layout, SectionData, SectionHeader } from '../components';
import { CircleHover } from '../components/CircleHover';
import { BasicErrorCard } from '../components/ErrorCard';
import { MidiInputsDropdown } from '../components/MidiInputsDropdown';
import { Spinner } from '../components/Spinner';
import { getCourses } from '../submodules/MemoryFlashCore/src/redux/actions/get-courses-action';
import { coursesSelector } from '../submodules/MemoryFlashCore/src/redux/selectors/coursesSelector';
import { useNetworkState } from '../submodules/MemoryFlashCore/src/redux/selectors/useNetworkState';
import { useAppDispatch } from '../submodules/MemoryFlashCore/src/redux/store';

export const CoursesScreen = () => {
	const dispatch = useAppDispatch();
	const courses = useSelector(coursesSelector);
	const { isLoading, error } = useNetworkState('getCourses');
	useEffect(() => {
		dispatch(getCourses());
	}, []);

	return (
		<Layout>
			<div className='space-y-4'>
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
		</Layout>
	);
};

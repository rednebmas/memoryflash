import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout, Button } from '../components';
import { BasicErrorCard } from '../components/ErrorCard';
import { Spinner } from '../components/Spinner';
import {
	getCoursePreview,
	clearCoursePreview,
} from 'MemoryFlashCore/src/redux/actions/preview-actions';
import { importCourse } from 'MemoryFlashCore/src/redux/actions/import-actions';
import { useNetworkState } from 'MemoryFlashCore/src/redux/selectors/useNetworkState';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';

export const CoursePreviewScreen: React.FC = () => {
	const { courseId } = useParams<{ courseId: string }>();
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const preview = useAppSelector((state) => state.community.coursePreview);
	const user = useAppSelector((state) => state.auth.user);
	const { isLoading, error } = useNetworkState('getCoursePreview');
	const { isLoading: isImporting } = useNetworkState('importCourse');

	useEffect(() => {
		if (courseId) {
			dispatch(getCoursePreview(courseId));
		}
		return () => {
			dispatch(clearCoursePreview());
		};
	}, [dispatch, courseId]);

	const handleImport = () => {
		if (!courseId) return;
		dispatch(importCourse(courseId));
		navigate('/');
	};

	if (isLoading) {
		return (
			<Layout subtitle="Course Preview">
				<Spinner show />
			</Layout>
		);
	}

	if (error || !preview) {
		return (
			<Layout subtitle="Course Preview">
				<BasicErrorCard error={error || 'Course not found or is private'} />
			</Layout>
		);
	}

	return (
		<Layout subtitle="Course Preview">
			<div className="max-w-md mx-auto space-y-6">
				<div className="bg-white rounded-lg shadow p-6 space-y-4">
					<h2 className="text-xl font-semibold text-gray-900">{preview.course.name}</h2>
					<p className="text-sm text-gray-500">
						{preview.course.deckCount}{' '}
						{preview.course.deckCount === 1 ? 'deck' : 'decks'} •{' '}
						{preview.course.totalCardCount}{' '}
						{preview.course.totalCardCount === 1 ? 'card' : 'cards'}
					</p>
				</div>

				{preview.decks.length > 0 && (
					<div className="bg-white rounded-lg shadow p-6 space-y-3">
						<h3 className="text-lg font-medium text-gray-900">Decks</h3>
						<ul className="divide-y divide-gray-100">
							{preview.decks.map((deck) => (
								<li
									key={deck._id}
									className="py-2 flex justify-between items-center"
								>
									<span className="text-sm text-gray-900">{deck.name}</span>
									<span className="text-xs text-gray-500">
										{deck.cardCount} {deck.cardCount === 1 ? 'card' : 'cards'}
									</span>
								</li>
							))}
						</ul>
					</div>
				)}

				{user ? (
					<div className="bg-white rounded-lg shadow p-6 space-y-4">
						<Button onClick={handleImport} disabled={isImporting} className="w-full">
							{isImporting ? 'Importing...' : 'Import Entire Course'}
						</Button>
					</div>
				) : (
					<div className="bg-white rounded-lg shadow p-6 text-center space-y-4">
						<p className="text-gray-600">
							Sign in to import this course to your library
						</p>
						<div className="flex gap-3 justify-center">
							<Link
								to="/auth/login"
								className="inline-flex justify-center rounded-md bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-400"
							>
								Log In
							</Link>
							<Link
								to="/auth/sign-up"
								className="inline-flex justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
							>
								Sign Up
							</Link>
						</div>
					</div>
				)}
			</div>
		</Layout>
	);
};

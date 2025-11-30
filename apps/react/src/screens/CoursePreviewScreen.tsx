import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout, Button, LinkButton, ContentCard, PageTitle } from '../components';
import { BasicErrorCard } from '../components/feedback/ErrorCard';
import { Spinner } from '../components/feedback/Spinner';
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
			<div className="space-y-6">
				<ContentCard>
					<PageTitle as="h2">{preview.course.name}</PageTitle>
					<p className="text-sm text-muted">
						{preview.course.deckCount}{' '}
						{preview.course.deckCount === 1 ? 'deck' : 'decks'} •{' '}
						{preview.course.totalCardCount}{' '}
						{preview.course.totalCardCount === 1 ? 'card' : 'cards'}
					</p>
				</ContentCard>

				{preview.decks.length > 0 && (
					<ContentCard spacing="sm">
						<h3 className="text-lg font-medium text-fg">Decks</h3>
						<ul className="divide-y divide-default">
							{preview.decks.map((deck) => (
								<li key={deck._id}>
									<Link
										to={`/deck/${deck._id}/preview`}
										className="py-3 flex justify-between items-center hover:bg-lm-elevated dark:hover:bg-dm-elevated -mx-2 px-2 rounded"
									>
										<span className="text-sm text-fg">{deck.name}</span>
										<span className="caption">
											{deck.cardCount}{' '}
											{deck.cardCount === 1 ? 'card' : 'cards'}
										</span>
									</Link>
								</li>
							))}
						</ul>
					</ContentCard>
				)}

				{user ? (
					<ContentCard>
						<Button onClick={handleImport} disabled={isImporting} className="w-full">
							{isImporting ? 'Importing...' : 'Import Entire Course'}
						</Button>
					</ContentCard>
				) : (
					<ContentCard centered>
						<p className="text-muted">Sign in to import this course to your library</p>
						<div className="flex gap-3 justify-center">
							<LinkButton to="/auth/login">Log In</LinkButton>
							<LinkButton to="/auth/sign-up" variant="outline">
								Sign Up
							</LinkButton>
						</div>
					</ContentCard>
				)}
			</div>
		</Layout>
	);
};

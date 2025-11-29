import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout, Button } from '../components';
import { MusicNotation } from '../components/MusicNotation';
import { BasicErrorCard } from '../components/ErrorCard';
import { Spinner } from '../components/Spinner';
import {
	getDeckPreview,
	clearDeckPreview,
} from 'MemoryFlashCore/src/redux/actions/preview-actions';
import { importDeck } from 'MemoryFlashCore/src/redux/actions/import-actions';
import { useNetworkState } from 'MemoryFlashCore/src/redux/selectors/useNetworkState';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { userOwnedCoursesSelector } from 'MemoryFlashCore/src/redux/selectors/coursesSelector';
import { getCourses } from 'MemoryFlashCore/src/redux/actions/get-courses-action';
import { DeckPreviewCard } from 'MemoryFlashCore/src/redux/slices/communitySlice';
import { MultiSheetQuestion } from 'MemoryFlashCore/src/types/MultiSheetCard';

export const DeckPreviewScreen: React.FC = () => {
	const { deckId } = useParams<{ deckId: string }>();
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const preview = useAppSelector((state) => state.community.deckPreview);
	const user = useAppSelector((state) => state.auth.user);
	const courses = useAppSelector(userOwnedCoursesSelector);
	const { isLoading, error } = useNetworkState('getDeckPreview');
	const { isLoading: isImporting } = useNetworkState('importDeck');
	const [selectedCourseId, setSelectedCourseId] = useState<string>('');

	useEffect(() => {
		if (deckId) {
			dispatch(getDeckPreview(deckId));
		}
		return () => {
			dispatch(clearDeckPreview());
		};
	}, [dispatch, deckId]);

	useEffect(() => {
		if (user) {
			dispatch(getCourses());
		}
	}, [dispatch, user]);

	const handleImport = () => {
		if (!deckId) return;
		dispatch(importDeck(deckId, selectedCourseId || undefined));
		navigate('/');
	};

	if (isLoading) {
		return (
			<Layout subtitle="Deck Preview">
				<Spinner show />
			</Layout>
		);
	}

	if (error || !preview) {
		return (
			<Layout subtitle="Deck Preview">
				<BasicErrorCard error={error || 'Deck not found or is private'} />
			</Layout>
		);
	}

	return (
		<Layout subtitle="Deck Preview">
			<div className="max-w-md mx-auto space-y-6">
				<div className="bg-white rounded-lg shadow p-6 space-y-4">
					<h2 className="text-xl font-semibold text-gray-900">{preview.deck.name}</h2>
					{preview.course && (
						<p className="text-sm text-gray-500">Course: {preview.course.name}</p>
					)}
					<p className="text-sm text-gray-500">
						{preview.deck.cardCount} {preview.deck.cardCount === 1 ? 'card' : 'cards'}
					</p>
				</div>

				{user ? (
					<div className="bg-white rounded-lg shadow p-6 space-y-4">
						<h3 className="text-lg font-medium text-gray-900">Import to My Library</h3>
						<div>
							<label
								htmlFor="course-select"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Add to course (optional)
							</label>
							<select
								id="course-select"
								value={selectedCourseId}
								onChange={(e) => setSelectedCourseId(e.target.value)}
								className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
							>
								<option value="">Imported Decks (default)</option>
								{courses.map((course) => (
									<option key={course._id} value={course._id}>
										{course.name}
									</option>
								))}
							</select>
						</div>
						<Button onClick={handleImport} disabled={isImporting} className="w-full">
							{isImporting ? 'Importing...' : 'Import Deck'}
						</Button>
					</div>
				) : (
					<div className="bg-white rounded-lg shadow p-6 text-center space-y-4">
						<p className="text-gray-600">Sign in to import this deck to your library</p>
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

				{preview.cards && preview.cards.length > 0 && (
					<div className="bg-white rounded-lg shadow p-6 space-y-4">
						<h3 className="text-lg font-medium text-gray-900">Cards Preview</h3>
						<div className="space-y-4 max-h-96 overflow-y-auto">
							{preview.cards.map((card) => (
								<CardPreviewItem key={card._id} card={card} />
							))}
						</div>
					</div>
				)}
			</div>
		</Layout>
	);
};

const CardPreviewItem: React.FC<{ card: DeckPreviewCard }> = ({ card }) => {
	const question = card.question as MultiSheetQuestion | null;

	if (!question || !question.voices) {
		return (
			<div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
				<p className="text-sm text-gray-500 text-center">Card preview unavailable</p>
			</div>
		);
	}

	return (
		<div className="border border-gray-200 rounded-lg p-3 overflow-hidden">
			<MusicNotation data={question} />
		</div>
	);
};

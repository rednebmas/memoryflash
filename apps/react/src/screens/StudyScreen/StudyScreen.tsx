import { ListBulletIcon, PresentationChartLineIcon, PlusIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { CircleHover } from '../../components/ui/CircleHover';
import { Layout } from '../../components/layout/Layout';
import { StudyScreenEmptyState } from './StudyScreenEmptyState';
import { AnswerValidator } from '../../components/answer-validators/AnswerValidator';
import { Keyboard } from '../../components/keyboard/KeyBoard';
import { ChordMemoryDebugDialog } from '../../components/ChordMemoryDebugDialog';
import { CardCarousel } from '../../components/CardCarousel';
import { getDeck } from 'MemoryFlashCore/src/redux/actions/get-deck-action';
import { schedule } from 'MemoryFlashCore/src/redux/actions/schedule-cards-action';
import { selectActivePresentationMode } from 'MemoryFlashCore/src/redux/selectors/activePresentationModeSelector';
import {
	attemptsStatsSelector,
	bpmSelector,
} from 'MemoryFlashCore/src/redux/selectors/attemptsStatsSelector';
import { sessionCardsSelector } from 'MemoryFlashCore/src/redux/selectors/scheduledCardsSelector';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { useDeckIdPath } from '../useDeckIdPath';
import { Metronome } from './Metronome';
import { QuestionPresentationModePills } from './QuestionPresentationModePills';
import Timer from './Timer';
import { IS_TEST_ENV } from '../../utils/constants';

export const StudyScreen = () => {
	const dispatch = useAppDispatch();
	const { cards, index } = useAppSelector(sessionCardsSelector);
	const [hideFutureCards, setHideFutureCards] = useState(false);
	const attemptsStats = useAppSelector(attemptsStatsSelector);
	const { tooLongTime, median } = attemptsStats || { tooLongTime: 0, median: 0 };
	const { bpm, goalTime } = useAppSelector(bpmSelector);
	const { deckId, deck } = useDeckIdPath();
	const activePresentationMode = useAppSelector(selectActivePresentationMode);
	const { currStartTime } = useAppSelector((state) => state.scheduler);
	const course = useAppSelector((state) =>
		deck?.courseId ? state.courses.entities[deck.courseId] : undefined,
	);
	const user = useAppSelector((state) => state.auth.user);

	const timeSinceCardStart = () => (currStartTime > 0 ? (Date.now() - currStartTime) / 1000 : 0);

	useEffect(() => {
		if (deckId) {
			dispatch(getDeck(deckId)).then(() => {
				dispatch(schedule(deckId));
			});
		}
	}, [deckId, dispatch]);

	useEffect(() => {
		if (tooLongTime <= 0) return;
		const timer = setTimeout(
			() => setHideFutureCards(true),
			(tooLongTime - timeSinceCardStart()) * 1000,
		);
		return () => clearTimeout(timer);
	}, [cards[index], hideFutureCards, tooLongTime]);

	useEffect(() => {
		if (hideFutureCards) setHideFutureCards(false);
	}, [index]);

	return (
		<Layout
			back={`/course/${deck?.courseId}`}
			contentClassName="max-w-none sm:px-0 lg:px-0"
			right={
				<>
					<Metronome bpm={bpm} />
					<CircleHover link={`stats`}>
						<PresentationChartLineIcon className="w-5 h-5 stroke-2" />
					</CircleHover>
					<CircleHover link={`list`}>
						<ListBulletIcon className="w-5 h-5 stroke-2" />
					</CircleHover>
					{course && user && course.userId === user._id && (
						<CircleHover link={`/study/${deckId}/notation`}>
							<PlusIcon className="w-5 h-5 stroke-2" />
						</CircleHover>
					)}
				</>
			}
			subtitle={course && deck && `${course?.name} · ${deck?.name}`}
		>
			<StudyScreenEmptyState />
			<CardCarousel
				cards={cards}
				index={index}
				hideFutureCards={hideFutureCards}
				user={user}
				activePresentationMode={activePresentationMode}
			/>
			<div>
				<QuestionPresentationModePills card={cards[index]} />
				{cards[index] && <ChordMemoryDebugDialog card={cards[index]} />}
				<Keyboard />
				{!IS_TEST_ENV && (
					<div className="text-center text-xs">
						tooLongTime: {tooLongTime.toFixed(0)}s, bpm: {bpm}, median:{' '}
						{median.toFixed(1)}
						s, goal: {goalTime.toFixed(1)}s, timeSinceStart:{' '}
						<Timer
							className={clsx(
								'font-serif',
								timeSinceCardStart() > tooLongTime && 'text-green-300',
							)}
							startTime={currStartTime}
						/>
					</div>
				)}
			</div>
			<AnswerValidator card={cards[index]} />
		</Layout>
	);
};

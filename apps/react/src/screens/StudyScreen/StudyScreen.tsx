import { ListBulletIcon, PresentationChartLineIcon, PlusIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { CircleHover } from '../../components/ui/CircleHover';
import { Layout } from '../../components/layout/Layout';
import { StudyScreenEmptyState } from './StudyScreenEmptyState';
import { useScheduleDeck } from './useScheduleDeck';
import { DeckSettingsButton } from '../../components/DeckSettingsButton';
import { AnswerValidator } from '../../components/answer-validators/AnswerValidator';
import { ChordInputModeToggle } from '../../components/chord-pad/ChordInputModeToggle';
import { InstrumentToggle } from '../../components/sax/InstrumentToggle';
import { RestartCardPill } from '../../components/RestartCardPill';
import { SaxFingeringHint } from '../../components/sax/SaxFingeringHint';
import { StudyInput } from './StudyInput';
import { ChordMemoryDebugDialog } from '../../components/ChordMemoryDebugDialog';
import { CardCarousel } from '../../components/CardCarousel';
import {
	selectActivePresentationMode,
	selectStudyPresentationModePills,
} from 'MemoryFlashCore/src/redux/selectors/activePresentationModeSelector';
import { attemptsStatsSelector } from 'MemoryFlashCore/src/redux/selectors/attemptsStatsSelector';
import { sessionCardsSelector } from 'MemoryFlashCore/src/redux/selectors/scheduledCardsSelector';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { useDeckIdPath } from '../useDeckIdPath';
import { Metronome } from './Metronome';
import { RhythmDeadline } from '../../components/rhythm/RhythmDeadline';
import { TimingStrip } from '../../components/rhythm/TimingStrip';
import { PresentationModePills } from '../../components/PresentationModePills';
import Timer from './Timer';
import { IS_TEST_ENV } from '../../utils/constants';

export const StudyScreen = () => {
	const { cards, index } = useAppSelector(sessionCardsSelector);
	const [hideFutureCards, setHideFutureCards] = useState(false);
	const attemptsStats = useAppSelector(attemptsStatsSelector);
	const { tooLongTime, median } = attemptsStats || { tooLongTime: 0, median: 0 };
	const { deckId, deck } = useDeckIdPath();
	const activePresentationMode = useAppSelector(selectActivePresentationMode);
	const { currStartTime } = useAppSelector((state) => state.scheduler);
	const course = useAppSelector((state) =>
		deck?.courseId ? state.courses.entities[deck.courseId] : undefined,
	);
	const user = useAppSelector((state) => state.auth.user);

	const timeSinceCardStart = () => (currStartTime > 0 ? (Date.now() - currStartTime) / 1000 : 0);

	useScheduleDeck(deckId);

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
					<Metronome />
					<CircleHover link={`stats`}>
						<PresentationChartLineIcon className="w-5 h-5 stroke-2" />
					</CircleHover>
					<CircleHover link={`list`}>
						<ListBulletIcon className="w-5 h-5 stroke-2" />
					</CircleHover>
					<DeckSettingsButton />
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
			<SaxFingeringHint />
			<TimingStrip />
			<div>
				<div className="flex justify-center items-center gap-3 flex-wrap">
					<PresentationModePills selector={selectStudyPresentationModePills} />
					<ChordInputModeToggle />
					<InstrumentToggle />
					<RestartCardPill />
				</div>
				{cards[index] && <ChordMemoryDebugDialog card={cards[index]} />}
				<StudyInput />
				{!IS_TEST_ENV && (
					<div className="text-center text-xs">
						tooLongTime: {tooLongTime.toFixed(0)}s, median: {median.toFixed(1)}s,
						timeSinceStart:{' '}
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
			<RhythmDeadline />
		</Layout>
	);
};

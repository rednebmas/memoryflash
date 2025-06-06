import { ListBulletIcon, PresentationChartLineIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CircleHover } from '../../components/CircleHover';
import { FlashCard } from '../../components/FlashCard';
import { Layout } from '../../components/Layout';
import { MidiInputsDropdown } from '../../components/MidiInputsDropdown';
import { Spinner } from '../../components/Spinner';
import { AnswerValidator } from '../../components/answer-validators/AnswerValidator';
import { Keyboard } from '../../components/keyboard/KeyBoard';
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
import useWindowResize from './useWindowResize';
import { AccountNavButton } from '../../components/navigation/AccountNavButton';

export const StudyScreen = () => {
	const dispatch = useAppDispatch();
	let { cards, index } = useAppSelector(sessionCardsSelector);
	const [hideFutureCards, setHideFutureCards] = useState(false);
	const attemptsStats = useAppSelector(attemptsStatsSelector);
	const { tooLongTime, median } = attemptsStats || {
		tooLongTime: 0,
		median: 0,
		goalTime: 0,
	};
	const { bpm, goalTime } = useAppSelector(bpmSelector);
	const { deckId, deck } = useDeckIdPath();
	const cardRefs = useRef<HTMLDivElement[]>([]);
	const cardContainerRef = useRef<HTMLDivElement | null>(null);
	const [cardsTranslation, setCardsTranslation] = useState('');
	const activePresentationMode = useAppSelector(selectActivePresentationMode);
	const { currStartTime } = useAppSelector((state) => state.scheduler);
	const course = useAppSelector((state) =>
		deck?.courseId ? state.courses.entities[deck.courseId] : undefined,
	);

	const timeSinceCardStart = () => (currStartTime > 0 ? (Date.now() - currStartTime) / 1000 : 0);

	const updateTranslation = () => {
		let totalWidth = 0;
		const cardContainerWidth = cardContainerRef.current?.offsetWidth || 0;

		cardRefs.current.slice(0, index + 1).forEach((ref, forEachIndex) => {
			if (!ref) return;
			let width = ref?.offsetWidth;
			const computedStyle = window.getComputedStyle(ref);
			const marginLeft = parseFloat(computedStyle.marginLeft) || 0;
			const marginRight = parseFloat(computedStyle.marginRight) || 0;
			width += marginLeft + marginRight;

			if (forEachIndex === index) {
				totalWidth += width / 2 || 0;
			} else {
				totalWidth += width || 0;
			}
		});

		const translation = cardContainerWidth / 2 - totalWidth;
		setCardsTranslation(`translateX(${translation}px)`);
	};

	useEffect(() => {
		if (deckId) {
			dispatch(getDeck(deckId)).then(() => {
				dispatch(schedule(deckId));
			});
		}
	}, [deckId, dispatch]);

	useEffect(() => {
		if (tooLongTime <= 0) return;
		const clear = setTimeout(
			() => {
				setHideFutureCards(true);
			},
			(tooLongTime - timeSinceCardStart()) * 1000,
		);
		return () => clearTimeout(clear);
	}, [cards[index], hideFutureCards, tooLongTime]);

	useEffect(() => {
		if (hideFutureCards) {
			setHideFutureCards(false);
		}
	}, [index]);

	useEffect(() => {
		cardRefs.current = cardRefs.current.slice(0, cards.length);
	}, [cards.length]);

	useWindowResize(() => {
		updateTranslation();
	});

	const cardOpactity = (_index: number) => {
		if (_index === index) {
			return 1;
		} else if (_index > index && hideFutureCards) {
			return 0;
		} else if (_index === index + 1) {
			return 0.75;
		} else {
			return 0.4;
		}
	};

	useLayoutEffect(() => {
		// the music rendering takes a little longer
		setTimeout(() => {
			updateTranslation();
		}, 1000 / 30);
	}, [cards.length, index, activePresentationMode]);

	return (
		<Layout
			back={`/course/${deck?.courseId}`}
			contentClassName="max-w-none sm:px-0 lg:px-0"
			right={
				<div className="flex items-center gap-4 ml-2">
					<div className="pl-1">
						<Metronome bpm={bpm} />
					</div>
					<CircleHover link={`stats`}>
						<PresentationChartLineIcon className="w-6 h-6 stroke-2" />
					</CircleHover>
					<CircleHover link={`list`}>
						<ListBulletIcon className="w-6 h-6 stroke-2" />
					</CircleHover>
					<MidiInputsDropdown />
					<AccountNavButton />
				</div>
			}
			subtitle={course && deck && `${course?.name} · ${deck?.name}`}
		>
			<div className="flex flex-1" ref={cardContainerRef}>
				<div
					className="flex items-center"
					style={{
						transform: cardsTranslation,
						transition: 'transform 0.5s ease',
					}}
				>
					<Spinner show={cards.length === 0} />
					{cards.map((card, i) => (
						<FlashCard
							ref={(el) => (cardRefs.current[i] = el!)}
							placement={i === index ? 'cur' : i < index ? 'answered' : 'scheduled'}
							key={card._id + i}
							card={card}
							className={`card-shadow-2 ${cardOpactity(i)}`}
							opacity={cardOpactity(i)}
						/>
					))}
				</div>
			</div>
			<div>
				<QuestionPresentationModePills card={cards[index]} />
				<Keyboard />
				<div className="text-center text-xs">
					tooLongTime: {tooLongTime.toFixed(0)}s, bpm: {bpm}, median: {median.toFixed(1)}
					s, goal: {goalTime.toFixed(1)}s, timeSinceStart:{' '}
					<Timer
						className={clsx(
							'font-serif',
							timeSinceCardStart() > tooLongTime && 'text-green-300',
						)}
						startTime={currStartTime}
					/>
				</div>
			</div>
			<AnswerValidator card={cards[index]} />
		</Layout>
	);
};

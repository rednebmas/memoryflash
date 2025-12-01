import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { FlashCard } from './FlashCard';
import { CardWithAttempts } from 'MemoryFlashCore/src/redux/selectors/currDeckCardsWithAttempts';
import { User } from 'MemoryFlashCore/src/types/User';
import { isCardOwner } from '../utils/useIsCardOwner';
import useWindowResize from '../screens/StudyScreen/useWindowResize';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { Confetti } from './feedback/Confetti';

const getBestTime = (card: CardWithAttempts) => {
	const correctAttempts = card.attempts.filter((a) => a.correct);
	if (correctAttempts.length === 0) return null;
	return Math.min(...correctAttempts.map((a) => a.timeTaken));
};

interface CardCarouselProps {
	cards: CardWithAttempts[];
	index: number;
	hideFutureCards: boolean;
	user?: User | null;
	activePresentationMode: string | null;
}

export const CardCarousel: React.FC<CardCarouselProps> = ({
	cards,
	index,
	hideFutureCards,
	user,
	activePresentationMode,
}) => {
	const cardRefs = useRef<HTMLDivElement[]>([]);
	const cardContainerRef = useRef<HTMLDivElement | null>(null);
	const [cardsTranslation, setCardsTranslation] = useState('');
	const incorrect = useAppSelector((state) => state.scheduler.incorrect);
	const [animationState, setAnimationState] = useState<'idle' | 'correct' | 'incorrect'>('idle');
	const [showConfetti, setShowConfetti] = useState(false);
	const prevIncorrectRef = useRef(incorrect);
	const prevIndexRef = useRef(index);
	const prevBestTimeRef = useRef<number | null>(null);

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
		cardRefs.current = cardRefs.current.slice(0, cards.length);
	}, [cards.length]);

	useWindowResize(() => {
		updateTranslation();
	});

	useLayoutEffect(() => {
		setTimeout(() => {
			updateTranslation();
		}, 1000 / 30);
	}, [cards.length, index, activePresentationMode]);

	// Detect incorrect answer
	useEffect(() => {
		if (incorrect && !prevIncorrectRef.current) {
			setAnimationState('incorrect');
			const timer = setTimeout(() => setAnimationState('idle'), 400);
			return () => clearTimeout(timer);
		}
		prevIncorrectRef.current = incorrect;
	}, [incorrect]);

	// Track best time for current card
	useEffect(() => {
		const currentCard = cards[index];
		if (currentCard) {
			prevBestTimeRef.current = getBestTime(currentCard);
		}
	}, [cards, index]);

	// Detect correct answer and check for new record
	useEffect(() => {
		if (index > prevIndexRef.current && cards.length > 0) {
			setAnimationState('correct');
			const timer = setTimeout(() => setAnimationState('idle'), 300);

			// Check if we beat the previous best time (card at prevIndex is now answered)
			const answeredCard = cards[prevIndexRef.current];
			if (answeredCard && prevBestTimeRef.current !== null) {
				const newBestTime = getBestTime(answeredCard);
				if (newBestTime !== null && newBestTime < prevBestTimeRef.current) {
					setShowConfetti(true);
					setTimeout(() => setShowConfetti(false), 100);
				}
			}

			prevIndexRef.current = index;
			return () => clearTimeout(timer);
		}
		prevIndexRef.current = index;
	}, [index, cards]);

	const cardOpacity = (_index: number) => {
		if (_index === index) return 1;
		if (_index > index && hideFutureCards) return 0;
		if (_index === index + 1) return 0.75;
		return 0.4;
	};

	const getCardAnimation = (_index: number) => {
		if (_index !== index) return '';
		if (animationState === 'correct') return 'animate-card-correct';
		if (animationState === 'incorrect') return 'animate-card-incorrect';
		return '';
	};

	return (
		<div className="flex flex-1 relative" ref={cardContainerRef}>
			<Confetti show={showConfetti} />
			<div
				className="flex items-center"
				style={{
					transform: cardsTranslation,
					transition: 'transform 0.5s ease',
				}}
			>
				{cards.map((card, i) => {
					const isOwner = isCardOwner(card, user ?? undefined);
					const isActive = i === index;
					return (
						<FlashCard
							key={card._id + i}
							ref={(el) => (cardRefs.current[i] = el!)}
							placement={isActive ? 'cur' : i < index ? 'answered' : 'scheduled'}
							card={card}
							className={`card-shadow-2 ${getCardAnimation(i)}`}
							opacity={cardOpacity(i)}
							showEdit={isOwner && isActive}
							showDelete={isOwner && isActive}
						/>
					);
				})}
			</div>
		</div>
	);
};

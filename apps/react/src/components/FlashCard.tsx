import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CardWithAttempts } from 'MemoryFlashCore/src/redux/selectors/currDeckCardsWithAttempts';
import { cardPracticeLabelSelector } from 'MemoryFlashCore/src/redux/selectors/cardPracticeSelector';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { CardTypeEnum, IntervalCard } from 'MemoryFlashCore/src/types/Cards';
import React, { forwardRef } from 'react';
import { FlashCardOptionsMenu } from './FlashCardOptionsMenu';
import { MultiSheetCardQuestion } from './FlashCards/MultiSheetCardQuestion';
import { Pill } from './ui/Pill';
import { RetryStatus } from './RetryStatus';
import { AttemptTime } from './FlashCards/AttemptTime';
import { rendersAsText } from 'MemoryFlashCore/src/lib/presentationMode';
import {
	missedSelector,
	wrongNoteSelector,
} from 'MemoryFlashCore/src/redux/selectors/retryStatusSelector';

type Placement = 'cur' | 'scheduled' | 'answered' | 'list';

interface FlashCardProps {
	card: CardWithAttempts;
	placement: Placement;
	className?: string;
	opacity?: number;
	showEdit?: boolean;
	showDelete?: boolean;
}

export interface QuestionRender {
	card: CardWithAttempts;
	placement: Placement;
}

const IntervalCardQuestion: React.FC<QuestionRender> = ({ card }) => {
	const c = card as IntervalCard;
	return (
		<span>
			{c.question.direction === 'up' ? '↑' : '↓'} {c.question.interval} of {c.question.note}
		</span>
	);
};

let QuestionComponentMap: { [cardType: string]: React.FC<QuestionRender> } = {
	[CardTypeEnum.Interval]: IntervalCardQuestion,
	[CardTypeEnum.MultiSheet]: MultiSheetCardQuestion,
};

export const FlashCard = forwardRef<HTMLDivElement, FlashCardProps>(
	({ card, className, opacity, placement, showEdit, showDelete }, ref) => {
		const QuestionComponent = QuestionComponentMap[card.type];
		if (!QuestionComponent) {
			console.error('No question component found for card type', card.type);
			return null;
		}

		return (
			<div
				ref={ref}
				className={`relative card-container flex flex-col justify-between items-center min-w-[15rem] m-h-60  m-4 ${className}`}
				style={{
					opacity,
					transition: 'opacity 0.5s ease',
				}}
			>
				<div className="absolute right-1 top-1">
					<FlashCardOptionsMenu card={card} showEdit={showEdit} showDelete={showDelete} />
				</div>
				<div className="text-4xl font-medium flex flex-1 justify-center items-center">
					<QuestionComponent card={card} placement={placement} />
				</div>
				{placement === 'list' ? (
					<CardPracticeStats card={card} />
				) : (
					<FlashCardStatus card={card} placement={placement} />
				)}
			</div>
		);
	},
);

const CardPracticeStats: React.FC<{ card: CardWithAttempts }> = ({ card }) => {
	const label = useAppSelector((state) => cardPracticeLabelSelector(state, card._id));
	return <span className="caption py-1">{label}</span>;
};

const FlashCardStatus: React.FC<QuestionRender> = ({ card, placement }) => {
	const modes = useAppSelector((state) => state.settings.presentationModes);
	return (
		<>
			{!rendersAsText(card, modes) && <AttemptTime time={card.attempts?.[0]?.timeTaken} />}
			<FlashCardIcons card={card} placement={placement} />
			{placement === 'cur' && <RetryStatus />}
		</>
	);
};

export const FlashCardIcons: React.FC<{ card: CardWithAttempts; placement: Placement }> = ({
	card,
	placement,
}) => {
	const wrongNote = useAppSelector(wrongNoteSelector);
	const missed = useAppSelector(missedSelector) && placement === 'cur';
	let correct: boolean | undefined = undefined;
	let showNew = false;
	if (placement === 'cur' || placement === 'scheduled') {
		if (!card.attempts.find((c) => c.correct === true)) {
			showNew = true;
		}
	}

	if (wrongNote && placement === 'cur') {
		correct = false;
	} else if (placement === 'answered') {
		correct = card.attempts[0]?.correct;
	}

	return (
		<div className="w-full grid grid-cols-[1fr_auto_1fr] grid-rows-1 gap-0">
			<div className="col-start-2 flex justify-center items-center gap-2">
				{showNew && <Pill text="New" theme="green" ring={false} />}
				{missed && <Pill text="Missed" theme="amber" ring={false} />}
				{correct && <CheckIcon className="w-5 h-5 stroke-green-500 stroke-2" />}
				{correct == false && <XMarkIcon className="w-5 h-5 stroke-red-500 stroke-2" />}
			</div>
			<div className="col-start-3 flex  items-center flex-row-reverse"></div>
		</div>
	);
};

import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { forwardRef } from 'react';
import { CardContainer } from './CardContainer';
import { CardWithAttempts } from 'MemoryFlashCore/src/redux/selectors/currDeckCardsWithAttempts';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { CardTypeEnum, IntervalCard } from 'MemoryFlashCore/src/types/Cards';
import { MultiSheetCardQuestion } from './FlashCards/MultiSheetCardQuestion';
import { Pill } from './Pill';

type Placement = 'cur' | 'scheduled' | 'answered';

interface FlashCardProps {
	card: CardWithAttempts;
	placement: Placement;
	className?: string;
	opacity?: number;
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
	({ card, className, opacity, placement }, ref) => {
		const QuestionComponent = QuestionComponentMap[card.type];
		if (!QuestionComponent) {
			console.error('No question component found for card type', card.type);
			return null;
		}

		return (
			<CardContainer
				ref={ref}
				className={`flex flex-col justify-between items-center min-w-[15rem] h-60  m-4 ${className}`}
				style={{
					opacity,
					transition: 'opacity 0.5s ease',
				}}
			>
				<div className="text-4xl font-medium flex flex-1 justify-center items-center">
					<QuestionComponent card={card} placement={placement} />
				</div>
				{card?.attempts?.length > 0 && (
					<span className="text-xs text-gray-600">
						{card.attempts[0].timeTaken.toFixed(1)}s
					</span>
				)}
				<FlashCardIcons card={card} placement={placement} />
			</CardContainer>
		);
	},
);

export const FlashCardIcons: React.FC<{ card: CardWithAttempts; placement: Placement }> = ({
	card,
	placement,
}) => {
	let incorrect = useAppSelector((state) => state.scheduler.incorrect);
	let correct: boolean | undefined = undefined;
	let showNew = false;
	if (placement === 'cur' || placement === 'scheduled') {
		if (!card.attempts.find((c) => c.correct === true)) {
			showNew = true;
		}
	}

	if (incorrect && placement === 'cur') {
		correct = false;
	} else if (placement === 'answered') {
		correct = card.attempts[0]?.correct;
	}

	return (
		<div className="w-full grid grid-cols-3 grid-rows-1 gap-0">
			<div className="col-start-2 flex justify-center items-center gap-2">
				{showNew && <Pill text="New" theme="green" ring={false} />}
				{correct && <CheckIcon className="w-5 h-5 stroke-green-500 stroke-2" />}
				{correct == false && <XMarkIcon className="w-5 h-5 stroke-red-500 stroke-2" />}
			</div>
			<div className="col-start-3 flex  items-center flex-row-reverse"></div>
		</div>
	);
};

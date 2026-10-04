import React from 'react';
import { Pill } from '../../components/ui/Pill';
import { setPresentationMode } from 'MemoryFlashCore/src/redux/actions/set-presentation-mode';
import { selectActivePresentationMode } from 'MemoryFlashCore/src/redux/selectors/activePresentationModeSelector';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { Card } from 'MemoryFlashCore/src/types/Cards';

interface QuestionPresentationModePillsProps {
	card?: Card;
}

export const QuestionPresentationModePills: React.FunctionComponent<
	QuestionPresentationModePillsProps
> = ({ card }) => {
	const active = useAppSelector(selectActivePresentationMode);
	const dispatch = useAppDispatch();

	if (!card || !card?.question.presentationModes?.length) return null;

	return (
		<div className="flex justify-center gap-2">
			{card.question.presentationModes.map(({ id }) => (
				<Pill
					key={id}
					text={id}
					theme={id === active ? 'green' : 'gray'}
					onClick={() => dispatch(setPresentationMode(card.type, id))}
				/>
			))}
		</div>
	);
};

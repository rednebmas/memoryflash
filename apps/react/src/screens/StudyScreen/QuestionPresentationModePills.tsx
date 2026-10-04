import React from 'react';
import { Pill } from '../../components/ui/Pill';
import { setPresentationMode } from 'MemoryFlashCore/src/redux/actions/set-presentation-mode';
import {
	selectActivePresentationMode,
	selectAvailablePresentationModes,
} from 'MemoryFlashCore/src/redux/selectors/activePresentationModeSelector';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { Card } from 'MemoryFlashCore/src/types/Cards';

interface QuestionPresentationModePillsProps {
	card?: Card;
}

export const QuestionPresentationModePills: React.FunctionComponent<
	QuestionPresentationModePillsProps
> = ({ card }) => {
	const active = useAppSelector(selectActivePresentationMode);
	const modes = useAppSelector(selectAvailablePresentationModes);
	const dispatch = useAppDispatch();

	if (!card || !modes.length) return null;

	return (
		<div className="flex justify-center gap-2">
			{modes.map(({ id }) => (
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

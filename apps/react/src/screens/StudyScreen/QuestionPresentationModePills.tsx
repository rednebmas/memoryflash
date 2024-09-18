import React from 'react';
import { Pill } from '../../components/Pill';
import { setPresentationMode } from 'MemoryFlashCore/src/redux/actions/set-presentation-mode';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { Card } from 'MemoryFlashCore/src/types/Cards';

interface QuestionPresentationModePillsProps {
	card?: Card;
}

export const QuestionPresentationModePills: React.FunctionComponent<
	QuestionPresentationModePillsProps
> = ({ card }) => {
	const presentationModesByQuestionType = useAppSelector(
		(state) => state.settings.presentationModes,
	);
	const dispatch = useAppDispatch();

	if (!card || !card?.question.presentationModes?.length) return null;

	const modes = card.question.presentationModes.map((mode) => mode.id);

	let activePresentationMode = presentationModesByQuestionType[card.type];

	if (!activePresentationMode || !modes.includes(activePresentationMode)) {
		activePresentationMode = modes[0];
		dispatch(setPresentationMode(card.type, activePresentationMode));
	}

	return (
		<div className='flex justify-center gap-2'>
			{modes.map((mode) => {
				return (
					<Pill
						key={mode}
						text={mode}
						theme={mode === activePresentationMode ? 'green' : 'gray'}
						onClick={() => {
							dispatch(setPresentationMode(card.type, mode));
						}}
					/>
				);
			})}
		</div>
	);
};

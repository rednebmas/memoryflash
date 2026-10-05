import React from 'react';
import { Pill } from './ui/Pill';
import { setPresentationMode } from 'MemoryFlashCore/src/redux/actions/set-presentation-mode';
import { PresentationModePillGroup } from 'MemoryFlashCore/src/redux/selectors/activePresentationModeSelector';
import { ReduxState, useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';

interface PresentationModePillsProps {
	selector: (state: ReduxState) => PresentationModePillGroup[];
}

export const PresentationModePills: React.FunctionComponent<PresentationModePillsProps> = ({
	selector,
}) => {
	const groups = useAppSelector(selector);
	const dispatch = useAppDispatch();

	if (!groups.length) return null;

	return (
		<div className="flex justify-center flex-wrap gap-2">
			{groups.flatMap(({ cardType, modes, active }) =>
				modes.map((id) => (
					<Pill
						key={`${cardType}-${id}`}
						text={id}
						theme={id === active ? 'green' : 'gray'}
						onClick={() => dispatch(setPresentationMode(cardType, id))}
					/>
				)),
			)}
		</div>
	);
};

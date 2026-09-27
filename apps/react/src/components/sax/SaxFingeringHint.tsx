import React from 'react';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import {
	currentSheetCardSelector,
	saxModeSelector,
} from 'MemoryFlashCore/src/redux/selectors/instrumentSelector';
import { SaxFingeringCharts } from './SaxFingerings';

export const SaxFingeringHint: React.FC = () => {
	const saxMode = useAppSelector(saxModeSelector);
	const card = useAppSelector(currentSheetCardSelector);
	if (!saxMode || !card) return null;
	return <SaxFingeringCharts question={card.question} compact />;
};

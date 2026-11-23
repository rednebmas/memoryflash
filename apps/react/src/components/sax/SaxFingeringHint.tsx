import React from 'react';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import {
	currentSheetCardSelector,
	fingeringHintModeSelector,
} from 'MemoryFlashCore/src/redux/selectors/instrumentSelector';
import { SaxFingeringCharts } from './SaxFingerings';

export const SaxFingeringHint: React.FC = () => {
	const showHint = useAppSelector(fingeringHintModeSelector);
	const card = useAppSelector(currentSheetCardSelector);
	if (!showHint || !card) return null;
	return <SaxFingeringCharts question={card.question} compact />;
};

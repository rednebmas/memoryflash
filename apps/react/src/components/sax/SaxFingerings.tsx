import React from 'react';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { settingsActions } from 'MemoryFlashCore/src/redux/slices/settingsSlice';
import { saveSetting } from 'MemoryFlashCore/src/redux/actions/save-setting-action';
import {
	SAX_KEY_LABELS,
	SaxNoteFingering,
	saxFingeringsForQuestion,
} from 'MemoryFlashCore/src/lib/saxFingerings';
import { MultiSheetQuestion } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { showSaxFingeringsSelector } from 'MemoryFlashCore/src/redux/selectors/instrumentSelector';
import { SettingCheckbox } from '../inputs/SettingCheckbox';
import { SaxFingeringChart } from './SaxFingeringChart';

type SaxNoteProps = { fingering: SaxNoteFingering; compact?: boolean };

const SaxNote: React.FC<SaxNoteProps> = ({ fingering: { note, keys }, compact }) => (
	<div className="flex flex-col items-center gap-2 max-w-[10rem]">
		{!compact && <span className="font-semibold">{note}</span>}
		{keys ? (
			<>
				<SaxFingeringChart keys={keys} className={compact ? 'w-20 h-44' : undefined} />
				<span className="caption text-center">
					{keys.length ? keys.map((k) => SAX_KEY_LABELS[k]).join(', ') : 'No keys (open)'}
				</span>
			</>
		) : (
			<span className="caption text-center">Outside the standard saxophone range</span>
		)}
	</div>
);

export const SaxFingeringsToggle: React.FC = () => {
	const dispatch = useAppDispatch();
	const show = useAppSelector(showSaxFingeringsSelector);
	return (
		<SettingCheckbox
			label="Show saxophone fingerings"
			checked={show}
			onChange={(on) => dispatch(saveSetting(settingsActions.setShowSaxFingerings(on)))}
		/>
	);
};

export const SaxFingeringCharts: React.FC<{ question: MultiSheetQuestion; compact?: boolean }> = ({
	question,
	compact,
}) => {
	const show = useAppSelector(showSaxFingeringsSelector);
	if (!show) return null;
	return (
		<div className="flex flex-wrap gap-6 justify-center">
			{saxFingeringsForQuestion(question).map((f) => (
				<SaxNote key={f.note} fingering={f} compact={compact} />
			))}
		</div>
	);
};

export const SaxFingerings: React.FC<{ question: MultiSheetQuestion }> = ({ question }) => {
	if (!saxFingeringsForQuestion(question).length) return null;
	return (
		<div className="space-y-4">
			<SaxFingeringsToggle />
			<SaxFingeringCharts question={question} />
		</div>
	);
};

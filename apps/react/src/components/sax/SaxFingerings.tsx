import React from 'react';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { settingsActions } from 'MemoryFlashCore/src/redux/slices/settingsSlice';
import {
	SAX_KEY_LABELS,
	SaxNoteFingering,
	saxFingeringsForQuestion,
} from 'MemoryFlashCore/src/lib/saxFingerings';
import { MultiSheetQuestion } from 'MemoryFlashCore/src/types/MultiSheetCard';
import { Checkbox } from '../inputs/Checkbox';
import { SaxFingeringChart } from './SaxFingeringChart';

const SaxNote: React.FC<{ fingering: SaxNoteFingering }> = ({ fingering: { note, keys } }) => (
	<div className="flex flex-col items-center gap-2 max-w-[10rem]">
		<span className="font-semibold">{note}</span>
		{keys ? (
			<>
				<SaxFingeringChart keys={keys} />
				<span className="caption text-center">
					{keys.length ? keys.map((k) => SAX_KEY_LABELS[k]).join(', ') : 'No keys (open)'}
				</span>
			</>
		) : (
			<span className="caption text-center">Outside the standard saxophone range</span>
		)}
	</div>
);

export const SaxFingerings: React.FC<{ question: MultiSheetQuestion }> = ({ question }) => {
	const dispatch = useAppDispatch();
	const show = useAppSelector((state) => !!state.settings.showSaxFingerings);
	const fingerings = saxFingeringsForQuestion(question);
	if (!fingerings.length) return null;

	return (
		<div className="space-y-4">
			<label className="flex items-center justify-center gap-2 text-sm">
				<Checkbox
					checked={show}
					onChange={(e) =>
						dispatch(settingsActions.setShowSaxFingerings(e.target.checked))
					}
				/>
				Show saxophone fingerings
			</label>
			{show && (
				<div className="flex flex-wrap gap-6 justify-center">
					{fingerings.map((f) => (
						<SaxNote key={f.note} fingering={f} />
					))}
				</div>
			)}
		</div>
	);
};

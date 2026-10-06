import React from 'react';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import {
	metronomeClickRowsSelector,
	metronomeClicksSelector,
} from 'MemoryFlashCore/src/redux/selectors/rhythmSelectors';
import { toggleClick } from 'MemoryFlashCore/src/lib/rhythm/metronomeClicks';
import { SegmentButton, SegmentedControl } from '../ui';

export const MetronomeClicks: React.FC<{ onChange: (clicks: number[]) => void }> = ({
	onChange,
}) => {
	const clicks = useAppSelector(metronomeClicksSelector);
	const rows = useAppSelector(metronomeClickRowsSelector);

	return (
		<div className="space-y-1">
			<p className="text-sm text-muted">Metronome clicks on</p>
			<div className="inline-flex">
				<SegmentedControl variant="compact">
					{rows.map(({ slot, label, on }) => (
						<SegmentButton
							key={slot}
							text={label}
							active={on}
							variant="compact"
							onClick={() => onChange(toggleClick(clicks, slot))}
						/>
					))}
				</SegmentedControl>
			</div>
			<p className="caption">Silent beats are still graded.</p>
		</div>
	);
};

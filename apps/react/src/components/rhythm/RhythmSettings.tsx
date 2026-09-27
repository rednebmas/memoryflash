import React from 'react';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { updateDeckRhythm } from 'MemoryFlashCore/src/redux/actions/update-deck-rhythm-action';
import { deckRhythmSettingsSelector } from 'MemoryFlashCore/src/redux/selectors/rhythmSelectors';
import {
	RHYTHM_BPM_OPTIONS,
	RhythmSettings as RhythmSettingsType,
	STRICTNESS_OPTIONS,
} from 'MemoryFlashCore/src/lib/rhythm/types';
import { SettingCheckbox } from '../inputs/SettingCheckbox';
import { InlineSelect } from '../inputs/InlineSelect';
import { CalibrateLatency } from './CalibrateLatency';

const BPM_OPTIONS = RHYTHM_BPM_OPTIONS.map((bpm) => ({ value: bpm, label: `${bpm} bpm` }));

export const RhythmSettings: React.FC = () => {
	const dispatch = useAppDispatch();
	const deckId = useAppSelector((state) => state.scheduler.deck);
	const settings = useAppSelector(deckRhythmSettingsSelector);
	if (!deckId) return null;
	const update = (change: Partial<RhythmSettingsType>) =>
		dispatch(updateDeckRhythm(deckId, { ...settings, ...change }));

	return (
		<div className="space-y-2">
			<p className="text-sm font-medium">Rhythm</p>
			<SettingCheckbox
				label="Play in time with the metronome"
				checked={settings.enabled}
				onChange={(enabled) => update({ enabled })}
			/>
			{settings.enabled && (
				<div className="flex flex-wrap items-center gap-3">
					<InlineSelect
						label="Tempo"
						value={settings.bpm}
						options={BPM_OPTIONS}
						onChange={(bpm) => update({ bpm })}
					/>
					<InlineSelect
						label="Timing"
						value={settings.strictness}
						options={STRICTNESS_OPTIONS}
						onChange={(strictness) => update({ strictness })}
					/>
					<CalibrateLatency />
				</div>
			)}
			<p className="caption">
				Start the metronome and play each chord on the beat. Your first chord sets beat one.
			</p>
		</div>
	);
};

import React from 'react';
import { Select, NumberInput } from '../inputs';
import { majorKeys } from 'MemoryFlashCore/src/lib/notes';
import { SettingsSection } from './SettingsSection';
import { ScoreToolbar } from './ScoreToolbar';
import { SegmentedPicker } from '../ui/SegmentedPicker';
import { NotationSettingsState } from './defaultSettings';
import { RecordPanel } from './recorder/RecordPanel';
import { SegmentSettings } from './SegmentSettings';

type SheetFields = Pick<
	NotationSettingsState,
	'keySig' | 'bars' | 'beatsPerBar' | 'inputMode' | 'segmentBars'
>;

interface SheetMusicSettingsProps {
	settings: SheetFields;
	onChange: (changes: Partial<SheetFields>) => void;
}

const INPUT_MODES = [
	{ value: 'step' as const, text: 'Step entry' },
	{ value: 'record' as const, text: 'Record' },
];

export const SheetMusicSettings: React.FC<SheetMusicSettingsProps> = ({ settings, onChange }) => (
	<SettingsSection title="Sheet Music Settings">
		<div className="space-y-4">
			<div className="flex flex-wrap gap-4">
				<label className="flex items-center gap-2">
					Key
					<Select
						value={settings.keySig}
						onChange={(e) => onChange({ keySig: e.target.value })}
					>
						{majorKeys.map((k) => (
							<option key={k}>{k}</option>
						))}
					</Select>
				</label>
				<label className="flex items-center gap-2">
					Time
					<Select
						value={settings.beatsPerBar}
						onChange={(e) => onChange({ beatsPerBar: parseInt(e.target.value, 10) })}
					>
						<option value={4}>4/4</option>
						<option value={3}>3/4</option>
					</Select>
				</label>
				<label className="flex items-center gap-2">
					Bars
					<NumberInput
						className="w-16"
						min={1}
						value={settings.bars}
						onChange={(e) => onChange({ bars: parseInt(e.target.value, 10) || 1 })}
					/>
				</label>
			</div>
			<SegmentedPicker
				options={INPUT_MODES}
				value={settings.inputMode}
				onChange={(inputMode) => onChange({ inputMode })}
			/>
			{settings.inputMode === 'record' ? (
				<RecordPanel keySig={settings.keySig} beatsPerBar={settings.beatsPerBar} />
			) : (
				<ScoreToolbar />
			)}
			<SegmentSettings
				segmentBars={settings.segmentBars}
				onChange={(segmentBars) => onChange({ segmentBars })}
			/>
		</div>
	</SettingsSection>
);

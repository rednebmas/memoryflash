import React from 'react';
import { Midi } from 'tonal';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { settingsActions } from 'MemoryFlashCore/src/redux/slices/settingsSlice';
import { saveSetting } from 'MemoryFlashCore/src/redux/actions/save-setting-action';
import { saxTypeSelector } from 'MemoryFlashCore/src/redux/selectors/instrumentSelector';
import { SAX_TYPES, SaxType } from 'MemoryFlashCore/src/lib/saxPitch';
import { Select } from '../inputs/Select';
import { SaxOptions } from './SaxOptions';
import { useReferenceTone } from './useReferenceTone';
import { CircleHover } from '../ui/CircleHover';
import { ProgressBar } from '../ui/ProgressBar';
import { SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { useSaxMicInput } from './useSaxMicInput';
import { useSaxRhythm } from './useSaxRhythm';
import { saxRhythmActiveSelector } from 'MemoryFlashCore/src/redux/selectors/saxRhythmSelectors';
import { SaxHoldSetting } from './SaxHoldSetting';

type ListeningStatusProps = { heard?: number; ready: boolean; error?: string };

const statusText = ({ heard, ready }: ListeningStatusProps) => {
	if (!ready) return 'Tap anywhere to start listening';
	if (heard === undefined) return 'Listening… play the note';
	return `Hearing ${Midi.midiToNoteName(heard)}`;
};

const ListeningStatus: React.FC<ListeningStatusProps> = (props) => {
	if (props.error) return <p className="text-sm text-red-500">{props.error}</p>;
	return <p className="text-sm text-muted whitespace-nowrap">🎷 {statusText(props)}</p>;
};

export const SaxStudyPanel: React.FC = () => {
	const dispatch = useAppDispatch();
	const saxType = useAppSelector(saxTypeSelector);
	const rhythm = useSaxRhythm();
	const rhythmActive = useAppSelector(saxRhythmActiveSelector);
	const { heard, progress, ready, error, muteFor } = useSaxMicInput(rhythm.onFrame);
	const playNote = useReferenceTone(muteFor);

	return (
		<div className="flex flex-col items-center gap-4 py-6">
			<div className="flex items-center gap-4">
				<ListeningStatus heard={heard} ready={ready} error={error} />
				{playNote && (
					<CircleHover onClick={playNote}>
						<SpeakerWaveIcon className="w-5 h-5 stroke-2" />
					</CircleHover>
				)}
				<Select
					className="w-36"
					aria-label="Saxophone type"
					value={saxType}
					onChange={(e) =>
						dispatch(saveSetting(settingsActions.setSaxType(e.target.value as SaxType)))
					}
				>
					{SAX_TYPES.map((type) => (
						<option key={type} value={type}>
							{type[0].toUpperCase() + type.slice(1)} sax
						</option>
					))}
				</Select>
			</div>
			<div className="flex flex-col items-center gap-2">
				{rhythmActive ? (
					<p className="text-sm text-muted">Hold each note for its full length</p>
				) : (
					<SaxHoldSetting />
				)}
				<ProgressBar progress={rhythmActive ? rhythm.coverage : progress} />
			</div>
			<SaxOptions />
		</div>
	);
};

import React from 'react';
import clsx from 'clsx';
import { Midi } from 'tonal';
import { useAppDispatch, useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { settingsActions } from 'MemoryFlashCore/src/redux/slices/settingsSlice';
import { saveSetting } from 'MemoryFlashCore/src/redux/actions/save-setting-action';
import { saxTypeSelector } from 'MemoryFlashCore/src/redux/selectors/instrumentSelector';
import { SAX_TYPES, SaxType } from 'MemoryFlashCore/src/lib/saxPitch';
import { Select } from '../inputs/Select';
import { SaxFingeringsToggle } from './SaxFingerings';
import { useSaxMicInput } from './useSaxMicInput';
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

const HoldProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
	<div className="w-64 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
		<div
			className={clsx('h-full', progress >= 1 ? 'bg-green-500' : 'bg-blue-500')}
			style={{ width: `${progress * 100}%` }}
		/>
	</div>
);

export const SaxStudyPanel: React.FC = () => {
	const dispatch = useAppDispatch();
	const saxType = useAppSelector(saxTypeSelector);
	const { heard, progress, ready, error } = useSaxMicInput();

	return (
		<div className="flex flex-col items-center gap-4 py-6">
			<div className="flex items-center gap-4">
				<ListeningStatus heard={heard} ready={ready} error={error} />
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
				<SaxHoldSetting />
				<HoldProgressBar progress={progress} />
			</div>
			<SaxFingeringsToggle />
		</div>
	);
};

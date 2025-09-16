import React from 'react';
import { BaseDuration, Duration } from 'MemoryFlashCore/src/lib/measure';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import { Staff } from 'MemoryFlashCore/src/lib/score';

interface Props {
	dur: BaseDuration;
	dotted: boolean;
	durations: Duration[];
	setDur: (d: BaseDuration) => void;
	toggleDot: () => void;
	addTieDuration: (d: Duration) => void;
	removeTieDuration: (index: number) => void;
	staff: Staff;
	setStaff: (s: Staff) => void;
	addRest: () => void;
}

const baseDurations: BaseDuration[] = ['w', 'h', 'q', '8', '16'];
const tieOptions: Duration[] = ['w', 'h', 'q', '8', '16', '32', '64'];

const btn = 'border rounded flex items-center justify-center text-lg';

export const ScoreToolbar: React.FC<Props> = ({
	dur,
	dotted,
	durations,
	setDur,
	toggleDot,
	addTieDuration,
	removeTieDuration,
	staff,
	setStaff,
	addRest,
}) => {
	const tiedDurations = durations.slice(1);
	return (
		<div className="flex flex-col gap-2">
			<div className="flex flex-wrap items-center gap-2">
				{baseDurations.map((d) => (
					<button
						key={d}
						className={`${btn} w-10 h-10 ${dur === d ? 'bg-gray-200' : ''}`}
						onClick={() => setDur(d)}
					>
						{d}
					</button>
				))}
				<button
					className={`${btn} w-10 h-10 ${dotted ? 'bg-gray-200' : ''}`}
					onClick={toggleDot}
				>
					.
				</button>
				<button className={`${btn} w-10 h-10`} onClick={addRest}>
					rest
				</button>
				<button
					className={`${btn} px-3 h-10 ${staff === StaffEnum.Treble ? 'bg-gray-200' : ''}`}
					onClick={() => setStaff(StaffEnum.Treble)}
				>
					treble
				</button>
				<button
					className={`${btn} px-3 h-10 ${staff === StaffEnum.Bass ? 'bg-gray-200' : ''}`}
					onClick={() => setStaff(StaffEnum.Bass)}
				>
					bass
				</button>
			</div>
			<div className="flex flex-wrap items-center gap-2">
				<span className="text-sm text-gray-600">ties</span>
				{tiedDurations.length === 0 && <span className="text-sm text-gray-400">none</span>}
				{tiedDurations.map((duration, index) => (
					<button
						key={`tie-${index}-${duration}`}
						className={`${btn} h-8 px-3 text-base`}
						onClick={() => removeTieDuration(index)}
					>
						{duration} ×
					</button>
				))}
				<div className="flex gap-1">
					{tieOptions.map((option) => (
						<button
							key={`tie-option-${option}`}
							className={`${btn} h-8 px-2 text-base`}
							onClick={() => addTieDuration(option)}
						>
							+{option}
						</button>
					))}
				</div>
			</div>
		</div>
	);
};

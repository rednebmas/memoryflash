import React from 'react';
import { BaseDuration } from 'MemoryFlashCore/src/lib/measure';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import { Staff } from 'MemoryFlashCore/src/lib/score';

interface Props {
	dur: BaseDuration;
	dotted: boolean;
	setDur: (d: BaseDuration) => void;
	toggleDot: () => void;
	staff: Staff;
	setStaff: (s: Staff) => void;
	addRest: () => void;
}

const durations: BaseDuration[] = ['w', 'h', 'q', '8', '16'];

const btn = 'border rounded flex items-center justify-center text-lg';

export const ScoreToolbar: React.FC<Props> = ({
	dur,
	dotted,
	setDur,
	toggleDot,
	staff,
	setStaff,
	addRest,
}) => (
	<div className="flex gap-2">
		{durations.map((d) => (
			<button
				key={d}
				className={`${btn} w-10 h-10 ${dur === d ? 'bg-gray-200' : ''}`}
				onClick={() => setDur(d)}
			>
				{d}
			</button>
		))}
		<button className={`${btn} w-10 h-10 ${dotted ? 'bg-gray-200' : ''}`} onClick={toggleDot}>
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
);

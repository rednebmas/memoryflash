import React from 'react';
import clsx from 'clsx';
import { BaseDuration, Duration } from 'MemoryFlashCore/src/lib/measure';
import { StaffEnum } from 'MemoryFlashCore/src/types/Cards';
import { useScoreEditor } from './ScoreEditor';

const baseDurations: BaseDuration[] = ['w', 'h', 'q', '8', '16'];
const tieOptions: Duration[] = ['w', 'h', 'q', '8', '16', '32', '64'];

const btnBase =
	'border border-default rounded flex items-center justify-center text-sm font-medium transition-colors';
const btnActive = 'bg-gray-200 dark:bg-dm-elevated';
const btnInactive = 'bg-lm-surface dark:bg-dm-surface hover:bg-gray-100 dark:hover:bg-dm-elevated';

interface ToolbarButtonProps {
	active?: boolean;
	onClick: () => void;
	children: React.ReactNode;
	className?: string;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
	active = false,
	onClick,
	children,
	className,
}) => (
	<button
		className={clsx(btnBase, active ? btnActive : btnInactive, className)}
		onClick={onClick}
	>
		{children}
	</button>
);

export const ScoreToolbar: React.FC = () => {
	const {
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
	} = useScoreEditor();
	const tiedDurations = durations.slice(1);
	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-wrap items-center gap-2">
				<span className="text-sm text-muted w-14">Duration</span>
				{baseDurations.map((d) => (
					<ToolbarButton
						key={d}
						active={dur === d}
						onClick={() => setDur(d)}
						className="w-9 h-9"
					>
						{d}
					</ToolbarButton>
				))}
				<ToolbarButton active={dotted} onClick={toggleDot} className="w-9 h-9">
					.
				</ToolbarButton>
			</div>
			<div className="flex flex-wrap items-center gap-2">
				<span className="text-sm text-muted w-14">Tie</span>
				{tiedDurations.length === 0 && <span className="text-sm text-muted">none</span>}
				{tiedDurations.map((duration, index) => (
					<ToolbarButton
						key={`tie-${index}-${duration}`}
						onClick={() => removeTieDuration(index)}
						className="h-8 px-2"
					>
						{duration} ×
					</ToolbarButton>
				))}
				{tieOptions.map((option) => (
					<ToolbarButton
						key={`tie-option-${option}`}
						onClick={() => addTieDuration(option)}
						className="h-8 px-2"
					>
						+{option}
					</ToolbarButton>
				))}
			</div>
			<div className="flex flex-wrap items-center gap-2">
				<span className="text-sm text-muted w-14">Staff</span>
				<ToolbarButton
					active={staff === StaffEnum.Treble}
					onClick={() => setStaff(StaffEnum.Treble)}
					className="px-3 h-9"
				>
					Treble
				</ToolbarButton>
				<ToolbarButton
					active={staff === StaffEnum.Bass}
					onClick={() => setStaff(StaffEnum.Bass)}
					className="px-3 h-9"
				>
					Bass
				</ToolbarButton>
				<ToolbarButton onClick={addRest} className="px-3 h-9">
					Rest
				</ToolbarButton>
			</div>
		</div>
	);
};

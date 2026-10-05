import React from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Checkbox } from '../inputs';
import { CircleHover } from '../ui/CircleHover';

export interface RowFrameProps {
	selected: boolean;
	onToggle: () => void;
	onRemove: () => void;
}

interface GeneratedRowFrameProps extends RowFrameProps {
	onEdit?: () => void;
	children: React.ReactNode;
}

export const GeneratedRowFrame: React.FC<GeneratedRowFrameProps> = ({
	selected,
	onToggle,
	onRemove,
	onEdit,
	children,
}) => (
	<div className="grid grid-cols-[auto_1fr_auto] gap-3 py-3 border-t border-default items-start">
		<Checkbox checked={selected} onChange={onToggle} className="mt-1" />
		<div className={`flex flex-col gap-2 min-w-0 ${selected ? '' : 'opacity-50'}`}>
			{children}
		</div>
		<div className="flex gap-1 text-muted">
			{onEdit && (
				<CircleHover onClick={onEdit}>
					<PencilIcon className="w-4 h-4" />
				</CircleHover>
			)}
			<CircleHover onClick={onRemove}>
				<TrashIcon className="w-4 h-4" />
			</CircleHover>
		</div>
	</div>
);

import React, { useState } from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { schedulers } from 'MemoryFlashCore/src/lib/schedulers';
import { activeSchedulerSelector } from 'MemoryFlashCore/src/redux/selectors/activeSchedulerSelector';
import { CircleHover } from './ui/CircleHover';
import { Modal } from './modals/Modal';
import { Button } from './ui/Button';
import { SchedulerPicker } from './SchedulerPicker';

export const DeckSettingsButton: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const active = useAppSelector(activeSchedulerSelector);
	const close = () => setIsOpen(false);

	return (
		<>
			<CircleHover onClick={() => setIsOpen(true)}>
				<Cog6ToothIcon className="w-5 h-5 stroke-2" />
			</CircleHover>
			<Modal isOpen={isOpen} onClose={close} title="Deck settings">
				<div className="p-6 space-y-4">
					<div className="space-y-2">
						<p className="text-sm font-medium">Card order</p>
						<SchedulerPicker />
						<p className="caption">{schedulers[active].description}</p>
					</div>
					<Button onClick={close}>Close</Button>
				</div>
			</Modal>
		</>
	);
};

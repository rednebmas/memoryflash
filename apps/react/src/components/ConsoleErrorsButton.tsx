import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { CircleHover } from './ui/CircleHover';
import { Modal } from './modals/Modal';
import { useConsoleErrors } from '../utils/useConsoleErrors';
import { isIOSDebug } from '../utils/isIOSDebug';

export const ConsoleErrorsButton: React.FC = () => {
	const errors = useConsoleErrors();
	const [open, setOpen] = React.useState(false);

	if (!isIOSDebug() || errors.length === 0) return null;

	return (
		<>
			<CircleHover onClick={() => setOpen(true)}>
				<ExclamationTriangleIcon className="w-6 h-6 stroke-2 text-red-600" />
			</CircleHover>
			<Modal isOpen={open} onClose={() => setOpen(false)} title="Console Errors">
				<div className="px-6 pb-6 space-y-2 max-h-80 overflow-y-auto">
					{errors.map((e, i) => (
						<p key={i} className="text-sm text-red-600 break-words">
							{e}
						</p>
					))}
				</div>
			</Modal>
		</>
	);
};

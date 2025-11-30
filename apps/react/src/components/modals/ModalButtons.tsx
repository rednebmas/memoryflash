import React from 'react';
import { Button, ButtonVariant } from '../ui/Button';

export interface ModalButtonsProps {
	onCancel: () => void;
	onConfirm: () => void;
	cancelText?: string;
	confirmText?: string;
	confirmVariant?: ButtonVariant;
	confirmDisabled?: boolean;
}

export const ModalButtons: React.FC<ModalButtonsProps> = ({
	onCancel,
	onConfirm,
	cancelText = 'Cancel',
	confirmText = 'Confirm',
	confirmVariant = 'primary',
	confirmDisabled = false,
}) => {
	return (
		<div className="mt-8 sm:flex sm:pl-4 gap-3 justify-end bg-gray-50 px-6 pt-3 pb-4 border-t border-gray-100 dark:bg-gray-900 dark:border-gray-700">
			<Button
				variant="outline"
				onClick={onCancel}
				className="mt-3 w-full sm:mt-0 sm:w-auto mb-3 sm:mb-0"
			>
				{cancelText}
			</Button>
			<Button
				variant={confirmVariant}
				onClick={onConfirm}
				disabled={confirmDisabled}
				className="w-full sm:w-auto"
			>
				{confirmText}
			</Button>
		</div>
	);
};

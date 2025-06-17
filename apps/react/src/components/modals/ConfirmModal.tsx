import React from 'react';
import { Modal, ModalProps } from './Modal';

export interface ConfirmModalProps extends Omit<ModalProps, 'children' | 'title'> {
	message: string;
	confirmText?: string;
	onConfirm: () => void;
	title?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
	isOpen,
	onClose,
	message,
	confirmText = 'Delete',
	onConfirm,
	title,
}) => (
	<Modal isOpen={isOpen} onClose={onClose} title={title}>
		<div className="px-6">
			<div className="mt-3 mb-6 text-center sm:mt-0 sm:text-left">{message}</div>
		</div>
		<div className="mt-8  sm:flex sm:pl-4 gap-3 justify-end bg-gray-50 px-6 pt-3 pb-4 border-t border-gray-100">
			<button
				type="button"
				data-autofocus
				onClick={onClose}
				className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto mb-3 sm:mb-0"
			>
				Cancel
			</button>
			<button
				type="button"
				onClick={() => {
					onConfirm();
					onClose();
				}}
				className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:w-auto"
			>
				{confirmText}
			</button>
		</div>
	</Modal>
);

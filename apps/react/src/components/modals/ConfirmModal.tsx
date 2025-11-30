import React from 'react';
import { Modal, ModalProps } from './Modal';
import { ModalButtons } from './ModalButtons';

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
		<ModalButtons
			onCancel={onClose}
			onConfirm={() => {
				onConfirm();
				onClose();
			}}
			confirmText={confirmText}
			confirmVariant="danger"
		/>
	</Modal>
);

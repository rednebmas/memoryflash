import React, { useEffect, useState } from 'react';
import { Modal, ModalProps } from './Modal';
import { InputField } from '../inputs';
import { ModalButtons } from './ModalButtons';

export interface InputModalProps extends Omit<ModalProps, 'children' | 'title'> {
	label: string;
	value?: string;
	onSave: (val: string) => void;
	saveText?: string;
	title?: string;
}

export const InputModal: React.FC<InputModalProps> = ({
	isOpen,
	onClose,
	label,
	value = '',
	onSave,
	saveText = 'Save',
	title,
}) => {
	const [val, setVal] = useState(value);
	useEffect(() => {
		if (isOpen) setVal(value);
	}, [isOpen, value]);
	const handle = () => {
		onSave(val);
		onClose();
	};
	return (
		<Modal isOpen={isOpen} onClose={onClose} title={title}>
			<div className="px-6">
				<div className="mt-3 mb-6 text-center sm:mt-0 sm:text-left">
					<InputField
						data-autofocus
						id="input-modal"
						label={label}
						value={val}
						onChange={(e) => setVal(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') handle();
						}}
					/>
				</div>
			</div>
			<ModalButtons onCancel={onClose} onConfirm={handle} confirmText={saveText} />
		</Modal>
	);
};

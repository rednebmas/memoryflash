import React, { useEffect, useState } from 'react';
import { Modal, ModalProps } from './Modal';
import { InputField } from '../inputs';

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
			<div className="mt-8  sm:flex sm:pl-4 gap-3 justify-end bg-gray-50 px-6 pt-3 pb-4 border-t border-gray-100">
				<button
					type="button"
					onClick={onClose}
					className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto mb-3 sm:mb-0"
				>
					Cancel
				</button>
				<button
					type="button"
					onClick={handle}
					className="inline-flex w-full justify-center rounded-md bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-400 sm:w-auto"
				>
					{saveText}
				</button>
			</div>
		</Modal>
	);
};

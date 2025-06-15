import React, { useEffect, useState } from 'react';
import { ModalContainer } from './ModalContainer';

interface TextFieldModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	initialValue: string;
	onSave: (value: string) => void;
	placeholder?: string;
	primaryButtonText?: string;
	secondaryButtonText?: string;
	isLoading?: boolean;
	validateInput?: (value: string) => boolean;
}

export const TextFieldModal: React.FC<TextFieldModalProps> = ({
	isOpen,
	onClose,
	title,
	initialValue,
	onSave,
	placeholder = '',
	primaryButtonText = 'Save',
	secondaryButtonText = 'Cancel',
	isLoading = false,
	validateInput = (value) => value.trim().length > 0,
}) => {
	const [value, setValue] = useState(initialValue);
	const isValid = validateInput(value);

	useEffect(() => {
		if (isOpen) {
			setValue(initialValue);
		}
	}, [isOpen, initialValue]);

	const handleSave = () => {
		if (isValid && !isLoading) {
			onSave(value);
		}
	};

	const footer = (
		<>
			<button
				type="button"
				data-autofocus
				onClick={onClose}
				className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto mb-3 sm:mb-0"
			>
				{secondaryButtonText}
			</button>
			<button
				type="button"
				onClick={handleSave}
				disabled={!isValid || isLoading}
				className={`inline-flex w-full justify-center rounded-md ${
					!isValid || isLoading
						? 'bg-blue-300 cursor-not-allowed'
						: 'bg-blue-500 hover:bg-blue-400'
				} px-3 py-2 text-sm font-semibold text-white shadow-sm sm:w-auto`}
			>
				{isLoading ? 'Loading...' : primaryButtonText}
			</button>
		</>
	);

	return (
		<ModalContainer isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
			<input
				type="text"
				className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm w-full"
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder={placeholder}
			/>
		</ModalContainer>
	);
};

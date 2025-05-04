// UpdateModal.tsx
import React from 'react';
import { TextFieldModal } from '../../components/modals/TextFieldModal';

interface UpdateModalProps {
	isOpen: boolean;
	label: string;
	value: string;
	onClose: () => void;
	onSave: (newValue: string) => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
	isOpen,
	label,
	value,
	onClose,
	onSave,
}) => {
	const handleSave = (newValue: string) => {
		onSave(newValue);
	};

	return (
		<TextFieldModal
			isOpen={isOpen}
			onClose={onClose}
			title={label}
			initialValue={value}
			onSave={handleSave}
		/>
	);
};

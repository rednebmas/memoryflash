// UpdateModal.tsx
import React from 'react';
import { TextFieldModal } from '../../components/TextFieldModal';

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
	return (
		<TextFieldModal
			isOpen={isOpen}
			onClose={onClose}
			title={label}
			initialValue={value}
			onSave={onSave}
			primaryButtonText="Save"
			secondaryButtonText="Cancel"
		/>
	);
};

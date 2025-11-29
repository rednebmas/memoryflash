import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { Menu, MenuButton } from '@headlessui/react';
import { DropdownMenu, DropdownItem } from './DropdownMenu';
import { CircleHover } from './CircleHover';
import { InputModal } from './modals/InputModal';
import { ConfirmModal } from './modals/ConfirmModal';
import { VisibilityModal } from './modals/VisibilityModal';
import { Visibility } from 'MemoryFlashCore/src/types/Deck';

interface CardOptionsMenuProps {
	itemName?: string;
	onRename: (name: string) => void;
	onDelete: () => void;
	renameLabel?: string;
	confirmMessage?: string;
	visibility?: Visibility;
	onVisibilityChange?: (visibility: Visibility) => void;
	isVisibilitySaving?: boolean;
}

export const CardOptionsMenu: React.FC<CardOptionsMenuProps> = ({
	itemName,
	onRename,
	onDelete,
	renameLabel = 'Name',
	confirmMessage = 'Are you sure?',
	visibility,
	onVisibilityChange,
	isVisibilitySaving,
}) => {
	const [isRenameOpen, setIsRenameOpen] = React.useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
	const [isVisibilityOpen, setIsVisibilityOpen] = React.useState(false);

	const items: DropdownItem[] = [
		{
			label: 'Rename',
			onClick: () => {
				if (itemName !== undefined) setIsRenameOpen(true);
				else onRename('');
			},
		},
		{
			label: 'Delete',
			onClick: () => {
				if (itemName !== undefined) setIsDeleteOpen(true);
				else onDelete();
			},
		},
	];

	if (visibility !== undefined && onVisibilityChange) {
		items.unshift({
			label: 'Sharing',
			onClick: () => setIsVisibilityOpen(true),
		});
	}

	return (
		<>
			<Menu as="div" className="relative inline-block text-left">
				<MenuButton className="focus:outline-none">
					<CircleHover>
						<EllipsisVerticalIcon className="w-5 h-5" />
					</CircleHover>
				</MenuButton>
				<DropdownMenu items={items} />
			</Menu>
			{itemName !== undefined && (
				<>
					<InputModal
						isOpen={isRenameOpen}
						onClose={() => setIsRenameOpen(false)}
						label={renameLabel}
						value={itemName}
						onSave={(val) => onRename(val)}
					/>
					<ConfirmModal
						isOpen={isDeleteOpen}
						onClose={() => setIsDeleteOpen(false)}
						message={confirmMessage}
						onConfirm={onDelete}
					/>
				</>
			)}
			{visibility !== undefined && onVisibilityChange && (
				<VisibilityModal
					isOpen={isVisibilityOpen}
					onClose={() => setIsVisibilityOpen(false)}
					currentVisibility={visibility}
					onSave={(v) => {
						onVisibilityChange(v);
						setIsVisibilityOpen(false);
					}}
					isSaving={isVisibilitySaving}
				/>
			)}
		</>
	);
};

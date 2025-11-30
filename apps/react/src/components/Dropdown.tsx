import { Menu, MenuButton } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import React from 'react';
import { DropdownMenu, DropdownItem } from './DropdownMenu';

interface DropdownProps {
	label: React.ReactNode;
	items: DropdownItem[];
	onButtonClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ label, items, onButtonClick }) => (
	<Menu as="div" className="relative inline-block text-left">
		<MenuButton
			onClick={onButtonClick}
			className="inline-flex w-full justify-center gap-x-1.5 rounded-lg bg-lm-surface dark:bg-dm-elevated px-3 py-2 text-sm font-medium text-fg border border-default hover:bg-gray-100 dark:hover:bg-white/10"
		>
			{label}
			<ChevronDownIcon className="-mr-1 h-5 w-5 text-muted" aria-hidden="true" />
		</MenuButton>
		<DropdownMenu items={items} />
	</Menu>
);

export default Dropdown;

import { Menu, MenuButton } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import React from 'react';
import { DropdownMenu, DropdownItem } from './DropdownMenu';

interface DropdownProps {
	label: React.ReactNode;
	items: DropdownItem[];
	onButtonClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined) => void;
	chevron?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ label, items, onButtonClick, chevron = true }) => {
	return (
		<Menu as="div" className="relative inline-block text-left">
			<div>
				<MenuButton
					onClick={onButtonClick}
					className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
				>
					{label}
					{chevron && (
						<ChevronDownIcon
							className="-mr-1 h-5 w-5 text-gray-400"
							aria-hidden="true"
						/>
					)}
				</MenuButton>
			</div>
			<DropdownMenu items={items} />
		</Menu>
	);
};

export default Dropdown;

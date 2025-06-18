import { MenuItem, MenuItems, Transition } from '@headlessui/react';
import React, { Fragment } from 'react';

export interface DropdownItem {
	label: string;
	onClick: () => void;
}

interface DropdownMenuProps {
	items: DropdownItem[];
}

function classNames(...classes: string[]) {
	return classes.filter(Boolean).join(' ');
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ items }) => (
	<Transition
		as={Fragment}
		enter="transition ease-out duration-100"
		enterFrom="transform opacity-0 scale-95"
		enterTo="transform opacity-100 scale-100"
		leave="transition ease-in duration-75"
		leaveFrom="transform opacity-100 scale-100"
		leaveTo="transform opacity-0 scale-95"
	>
		<MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
			<div className="py-1">
				{items.map((item, index) => (
					<MenuItem key={index}>
						{({ focus }) => (
							<button
								onClick={item.onClick}
								className={classNames(
									focus ? 'bg-gray-50 text-gray-900' : 'text-gray-700',
									'block w-full px-4 py-2 text-left text-sm',
								)}
							>
								{item.label}
							</button>
						)}
					</MenuItem>
				))}
			</div>
		</MenuItems>
	</Transition>
);

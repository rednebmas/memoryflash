import { MenuItem, MenuItems, Transition } from '@headlessui/react';
import clsx from 'clsx';
import React, { Fragment } from 'react';

export interface DropdownItem {
	label: string;
	onClick: () => void;
}

interface DropdownMenuProps {
	items: DropdownItem[];
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
		<MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-lg bg-surface border border-default shadow-lg focus:outline-none">
			<div className="py-1">
				{items.map((item, index) => (
					<MenuItem key={index}>
						{({ focus }) => (
							<button
								onClick={item.onClick}
								className={clsx(
									focus ? 'bg-gray-100 dark:bg-dm-elevated' : '',
									'block w-full px-4 py-2 text-left text-sm text-fg',
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

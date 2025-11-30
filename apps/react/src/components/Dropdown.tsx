import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import React, { Fragment } from 'react';

interface DropdownItem {
	label: string;
	onClick: () => void;
}

interface DropdownProps {
	label: React.ReactNode;
	items: DropdownItem[];
	onButtonClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ label, items, onButtonClick }) => {
	return (
		<Menu as="div" className="relative inline-block text-left">
			<div>
				<MenuButton
					onClick={onButtonClick}
					className="inline-flex w-full justify-center gap-x-1.5 rounded-lg bg-lm-surface dark:bg-dm-elevated px-3 py-2 text-sm font-medium text-fg border border-default hover:bg-gray-100 dark:hover:bg-white/10"
				>
					{label}
					<ChevronDownIcon className="-mr-1 h-5 w-5 text-muted" aria-hidden="true" />
				</MenuButton>
			</div>
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
		</Menu>
	);
};

export default Dropdown;

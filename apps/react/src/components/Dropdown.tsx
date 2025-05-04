import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import React, { Fragment } from 'react';

interface DropdownItem {
	label: string;
	onClick: () => void;
}

interface DropdownProps {
	label: string;
	items: DropdownItem[];
}

function classNames(...classes: string[]) {
	return classes.filter(Boolean).join(' ');
}

const Dropdown: React.FC<DropdownProps> = ({ label, items }) => {
	return (
		<Menu as="div" className="relative inline-block text-left">
			<div>
				<MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
					{label}
					<ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
				</MenuButton>
			</div>
			{/* 
			the transition causes an error to make the page reload, it happened on create deck screen when setting key to last item.
			<Transition
				as={Fragment}
				enter='transition ease-out duration-100'
				enterFrom='transform opacity-0 scale-95'
				enterTo='transform opacity-100 scale-100'
				leave='transition ease-in duration-75'
				leaveFrom='transform opacity-100 scale-100'
				leaveTo='transform opacity-0 scale-95'
			> */}
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
			{/* </Transition> */}
		</Menu>
	);
};

export default Dropdown;

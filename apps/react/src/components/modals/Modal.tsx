import React from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';

export interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => (
	<Dialog open={isOpen} onClose={onClose} className="relative z-10">
		<DialogBackdrop
			transition
			className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
		/>
		<div className="fixed inset-0 z-10 w-screen overflow-y-auto">
			<div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
				<DialogPanel
					transition
					className="relative transform overflow-hidden rounded-lg bg-white pt-2 sm:pt-5 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:mt-8 sm:w-full sm:max-w-lg  data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
				>
					{title && (
						<div className="px-6">
							<DialogTitle
								as="h3"
								className="text-base font-semibold leading-6 text-gray-900"
							>
								{title}
							</DialogTitle>
						</div>
					)}
					{children}
				</DialogPanel>
			</div>
		</div>
	</Dialog>
);
Modal.displayName = 'Modal';

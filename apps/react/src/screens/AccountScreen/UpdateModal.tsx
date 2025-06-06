// UpdateModal.tsx
import React, { useEffect } from 'react';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';

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
	const [newValue, setNewValue] = React.useState(value);

	useEffect(() => {
		if (isOpen) {
			setNewValue(value);
		}
	}, [isOpen, value]);

	const handleSave = () => {
		onSave(newValue);
		onClose();
	};

	return (
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
						<div className="px-6">
							<div className="mt-3 mb-6 text-center sm:mt-0 sm:text-left">
								<DialogTitle
									as="h3"
									className="text-base font-semibold leading-6 text-gray-900"
								>
									{label}
								</DialogTitle>
								<div className="mt-2">
									<input
										type="text"
										className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm w-full"
										value={newValue}
										onChange={(e) => {
											console.log('yoooooooooo');

											setNewValue(e.target.value);
										}}
									/>
								</div>
							</div>
						</div>
						<div className="mt-8  sm:flex sm:pl-4 gap-3 justify-end bg-gray-50 px-6 pt-3 pb-4 border-t border-gray-100">
							<button
								type="button"
								data-autofocus
								onClick={() => onClose()}
								className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto mb-3 sm:mb-0"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={() => handleSave()}
								className="inline-flex w-full justify-center rounded-md bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-400 sm:w-auto"
							>
								Save
							</button>
						</div>
					</DialogPanel>
				</div>
			</div>
		</Dialog>

		// <Dialog open={isOpen} onClose={onClose} className='relative z-10'>
		// 	{/* Background overlay */}
		// 	<DialogBackdrop
		// 		transition
		// 		className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[open]:opacity-100 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in'
		// 	/>

		// 	<div className='fixed inset-0 z-10 w-screen overflow-y-auto'>
		// 		<div className='flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0'>
		// 			<DialogPanel
		// 				transition
		// 				className='relative transform overflow-hidden rounded-lg bg-white px-6 pt-5 pb-4 text-left shadow-xl transition-all data-[closed]:opacity-0 data-[open]:opacity-100 data-[closed]:translate-y-4 data-[open]:translate-y-0 data-[closed]:scale-95 data-[open]:scale-100 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg sm:p-6'
		// 			>
		// 				{/* Modal content */}
		// 				<div className='sm:flex sm:items-start'>
		// 					<div className='text-center sm:ml-4 sm:text-left'>
		// 						<DialogTitle as='h3' className='text-lg font-medium leading-6 text-gray-900'>
		// 							Update {label}
		// 						</DialogTitle>
		// 						<div className='mt-2'>
		// 							<input
		// 								type='text'
		// 								className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm'
		// 								value={newValue}
		// 								onChange={(e) => setNewValue(e.target.value)}
		// 							/>
		// 						</div>
		// 					</div>
		// 				</div>
		// 				{/* Modal actions */}
		// 				<div className='mt-5 sm:mt-4 sm:flex sm:flex-row-reverse'>
		// 					<button
		// 						type='button'
		// 						onClick={handleSave}
		// 						className='inline-flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 sm:ml-3 sm:w-auto'
		// 					>
		// 						Save
		// 					</button>
		// 					<button
		// 						type='button'
		// 						data-autofocus
		// 						onClick={onClose}
		// 						className='mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto'
		// 					>
		// 						Cancel
		// 					</button>
		// 				</div>
		// 			</DialogPanel>
		// 		</div>
		// 	</div>
		// </Dialog>
	);
};

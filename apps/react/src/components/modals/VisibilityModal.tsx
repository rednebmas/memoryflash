import React, { useEffect, useState } from 'react';
import { Modal, ModalProps } from './Modal';
import { Visibility, VISIBILITIES } from 'MemoryFlashCore/src/types/Deck';
import { RadioGroup, Radio, Label, Description, Field } from '@headlessui/react';
import clsx from 'clsx';

const VISIBILITY_INFO: Record<Visibility, { label: string; description: string }> = {
	private: {
		label: 'Private',
		description: 'Only you can see this',
	},
	unlisted: {
		label: 'Unlisted',
		description: 'Anyone with the link can view and import',
	},
	public: {
		label: 'Public',
		description: 'Appears in community search results',
	},
};

export interface VisibilityModalProps extends Omit<ModalProps, 'children'> {
	currentVisibility: Visibility;
	onSave: (visibility: Visibility) => void;
	isSaving?: boolean;
}

export const VisibilityModal: React.FC<VisibilityModalProps> = ({
	isOpen,
	onClose,
	title = 'Visibility',
	currentVisibility,
	onSave,
	isSaving,
}) => {
	const [selected, setSelected] = useState<Visibility>(currentVisibility);

	useEffect(() => {
		if (isOpen) setSelected(currentVisibility);
	}, [isOpen, currentVisibility]);

	const handleSave = () => {
		onSave(selected);
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={title}>
			<div className="px-6 pt-4">
				<RadioGroup value={selected} onChange={setSelected}>
					<div className="space-y-2">
						{VISIBILITIES.map((visibility) => (
							<Field key={visibility}>
								<Radio
									value={visibility}
									className={({ checked }) =>
										clsx(
											'relative flex cursor-pointer rounded-lg px-4 py-3 border focus:outline-none',
											checked
												? 'bg-blue-50 border-blue-500'
												: 'bg-white border-gray-200 hover:bg-gray-50',
										)
									}
								>
									{({ checked }) => (
										<div className="flex w-full items-center justify-between">
											<div>
												<Label
													as="p"
													className={clsx(
														'font-medium',
														checked ? 'text-blue-900' : 'text-gray-900',
													)}
												>
													{VISIBILITY_INFO[visibility].label}
												</Label>
												<Description
													as="span"
													className={clsx(
														'text-sm',
														checked ? 'text-blue-700' : 'text-gray-500',
													)}
												>
													{VISIBILITY_INFO[visibility].description}
												</Description>
											</div>
											{checked && (
												<div className="shrink-0 text-blue-500">
													<CheckIcon className="h-5 w-5" />
												</div>
											)}
										</div>
									)}
								</Radio>
							</Field>
						))}
					</div>
				</RadioGroup>
			</div>
			<div className="mt-6 sm:flex sm:pl-4 gap-3 justify-end bg-gray-50 px-6 pt-3 pb-4 border-t border-gray-100">
				<button
					type="button"
					onClick={onClose}
					className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto mb-3 sm:mb-0"
				>
					Cancel
				</button>
				<button
					type="button"
					onClick={handleSave}
					disabled={isSaving}
					className="inline-flex w-full justify-center rounded-md bg-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-400 disabled:opacity-50 sm:w-auto"
				>
					{isSaving ? 'Saving...' : 'Save'}
				</button>
			</div>
		</Modal>
	);
};

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg viewBox="0 0 24 24" fill="none" className={className}>
		<circle cx={12} cy={12} r={12} fill="currentColor" opacity="0.2" />
		<path
			d="M7 13l3 3 7-7"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

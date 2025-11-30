import React, { useEffect, useState } from 'react';
import { Modal, ModalProps } from './Modal';
import { Visibility, VISIBILITIES } from 'MemoryFlashCore/src/types/Deck';
import { RadioGroup, Radio, Label, Description, Field } from '@headlessui/react';
import clsx from 'clsx';
import { ModalButtons } from './ModalButtons';

const VISIBILITY_INFO: Record<Visibility, { label: string; description: string }> = {
	private: { label: 'Private', description: 'Only you can see this' },
	unlisted: { label: 'Unlisted', description: 'Anyone with the link can view and import' },
	public: { label: 'Public', description: 'Appears in community search results' },
};

const getTextColor = (isDisabled: boolean, checked: boolean, variant: 'label' | 'description') => {
	if (isDisabled) return 'text-gray-400 dark:text-gray-500';
	if (!checked) return variant === 'label' ? 'text-fg' : 'text-muted';
	return variant === 'label' ? 'text-blue-900 dark:text-blue-100' : 'text-blue-700 dark:text-blue-300';
};

export interface VisibilityModalProps extends Omit<ModalProps, 'children'> {
	currentVisibility: Visibility;
	onSave: (visibility: Visibility) => void;
	isSaving?: boolean;
	disabledOptions?: Partial<Record<Visibility, string>>;
	warningForOptions?: Partial<Record<Visibility, string>>;
}

export const VisibilityModal: React.FC<VisibilityModalProps> = ({
	isOpen,
	onClose,
	title = 'Visibility',
	currentVisibility,
	onSave,
	isSaving,
	disabledOptions = {},
	warningForOptions = {},
}) => {
	const [selected, setSelected] = useState<Visibility>(currentVisibility);

	useEffect(() => {
		if (isOpen) setSelected(currentVisibility);
	}, [isOpen, currentVisibility]);

	return (
		<Modal isOpen={isOpen} onClose={onClose} title={title}>
			<div className="px-6 pt-4">
				<RadioGroup value={selected} onChange={setSelected}>
					<div className="space-y-2">
						{VISIBILITIES.map((visibility) => {
							const isDisabled = !!disabledOptions[visibility];
							return (
								<Field key={visibility}>
									<Radio
										value={visibility}
										disabled={isDisabled}
										className={({ checked }) =>
											clsx(
												'relative flex rounded-lg px-4 py-3 border focus:outline-none',
												isDisabled
													? 'cursor-not-allowed bg-gray-50 dark:bg-dm-elevated border-gray-200 dark:border-dm-border opacity-60'
													: 'cursor-pointer',
												!isDisabled &&
													checked &&
													'bg-blue-50 dark:bg-blue-900/30 border-blue-500',
												!isDisabled &&
													!checked &&
													'bg-surface border-default hover:bg-lm-elevated dark:hover:bg-dm-elevated',
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
															getTextColor(
																isDisabled,
																checked,
																'label',
															),
														)}
													>
														{VISIBILITY_INFO[visibility].label}
													</Label>
													<Description
														as="span"
														className={clsx(
															'text-sm',
															getTextColor(
																isDisabled,
																checked,
																'description',
															),
														)}
													>
														{isDisabled
															? disabledOptions[visibility]
															: VISIBILITY_INFO[visibility]
																	.description}
													</Description>
												</div>
												{checked && !isDisabled && (
													<div className="shrink-0 text-blue-500">
														<CheckIcon className="h-5 w-5" />
													</div>
												)}
											</div>
										)}
									</Radio>
								</Field>
							);
						})}
					</div>
				</RadioGroup>
				{warningForOptions[selected] && (
					<div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg">
						<p className="text-sm text-amber-800 dark:text-amber-200">{warningForOptions[selected]}</p>
					</div>
				)}
			</div>
			<ModalButtons
				onCancel={onClose}
				onConfirm={() => onSave(selected)}
				confirmText={isSaving ? 'Saving...' : 'Save'}
				confirmDisabled={isSaving}
			/>
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

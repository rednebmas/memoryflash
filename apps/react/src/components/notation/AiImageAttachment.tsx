import React, { useEffect, useRef } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { firstImageFile, imageFileToDataUrl } from '../../utils/imageFileToDataUrl';
import { useLatest } from '../../utils/useLatest';

interface AiImageAttachmentProps {
	image?: string;
	onChange: (image?: string) => void;
}

export const AiImageAttachment: React.FC<AiImageAttachmentProps> = ({ image, onChange }) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const attach = useLatest(async (files?: FileList | null) => {
		const file = firstImageFile(files);
		if (file) onChange(await imageFileToDataUrl(file));
	});

	useEffect(() => {
		const onPaste = (e: ClipboardEvent) => {
			if (firstImageFile(e.clipboardData?.files)) attach.current(e.clipboardData?.files);
		};
		document.addEventListener('paste', onPaste);
		return () => document.removeEventListener('paste', onPaste);
	}, [attach]);

	const onDrop = (e: React.DragEvent) => {
		e.preventDefault();
		attach.current(e.dataTransfer.files);
	};

	return (
		<div onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
			{image ? (
				<div className="relative inline-block">
					<img
						src={image}
						alt="Attached"
						className="max-h-40 rounded-md border border-default"
					/>
					<button
						type="button"
						aria-label="Remove image"
						onClick={() => onChange(undefined)}
						className="absolute -top-2 -right-2 rounded-full bg-surface border border-default p-1 text-fg"
					>
						<XMarkIcon className="w-4 h-4" />
					</button>
				</div>
			) : (
				<button
					type="button"
					onClick={() => inputRef.current?.click()}
					className="flex w-full items-center gap-2 rounded-md border border-dashed border-default px-3 py-3 text-sm text-lm-muted dark:text-dm-muted hover:border-accent"
				>
					<PhotoIcon className="w-5 h-5" />
					Attach a photo, e.g. sheet music
				</button>
			)}
			<input
				ref={inputRef}
				type="file"
				accept="image/*"
				className="hidden"
				data-testid="ai-image-input"
				onChange={(e) => {
					attach.current(e.target.files);
					e.target.value = '';
				}}
			/>
		</div>
	);
};

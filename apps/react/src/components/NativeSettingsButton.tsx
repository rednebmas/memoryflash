import React from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { CircleHover } from './CircleHover';
import { IS_PRODUCTION } from 'MemoryFlashCore/src/redux/env';

interface NativeSettingsButtonProps {
	className?: string;
}

export const NativeSettingsButton: React.FC<NativeSettingsButtonProps> = ({ className }) => {
	const isIosDebugBuild = typeof window !== 'undefined' && window.isIosDebugBuild;
	if (IS_PRODUCTION && !isIosDebugBuild) {
		return null;
	}

	return (
		<div className={className}>
			<CircleHover
				onClick={() =>
					(window as any).webkit?.messageHandlers?.openSettings?.postMessage('')
				}
			>
				<Cog6ToothIcon className="w-6 h-6 stroke-2" />
			</CircleHover>
		</div>
	);
};

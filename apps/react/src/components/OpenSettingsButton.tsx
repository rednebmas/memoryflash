import React from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { CircleHover } from './CircleHover';
import { isIOSDebug } from '../utils/isIOSDebug';

export const OpenSettingsButton: React.FC = () => {
	if (!isIOSDebug()) return null;
	return (
		<CircleHover
			onClick={() => (window as any).webkit?.messageHandlers?.openSettings?.postMessage('')}
		>
			<Cog6ToothIcon className="w-6 h-6 stroke-2" />
		</CircleHover>
	);
};

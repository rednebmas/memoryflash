import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { CircleHover } from './ui/CircleHover';
import { isIOSApp } from 'MemoryFlashCore/src/lib/iosApp';

export const RefreshButton: React.FC = () => {
	if (!isIOSApp()) return null;
	return (
		<CircleHover onClick={() => window.location.reload()}>
			<ArrowPathIcon className="w-5 h-5 stroke-2" aria-label="Refresh" />
		</CircleHover>
	);
};

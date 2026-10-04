import React from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { CircleHover } from './ui/CircleHover';
import { isIOSDebug, openIOSSettings } from '../utils/iosApp';

export const OpenSettingsButton: React.FC = () => {
	if (!isIOSDebug()) return null;
	return (
		<CircleHover onClick={openIOSSettings}>
			<Cog6ToothIcon className="w-6 h-6 stroke-2" />
		</CircleHover>
	);
};

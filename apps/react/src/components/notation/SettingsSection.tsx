import React from 'react';
import { SectionHeader } from '../SectionHeader';

interface SettingsSectionProps {
	title: string;
	children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => (
	<div className="border rounded-md p-4 space-y-2">
		<SectionHeader title={title} />
		<div>{children}</div>
	</div>
);

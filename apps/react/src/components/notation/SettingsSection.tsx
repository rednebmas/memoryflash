import React, { useState } from 'react';
import { SectionHeader } from '../SectionHeader';

interface SettingsSectionProps {
	title: string;
	children: React.ReactNode;
	collapsible?: boolean;
	collapsedByDefault?: boolean;
	hintText?: string;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
	title,
	children,
	collapsible = false,
	collapsedByDefault = false,
	hintText,
}) => {
	const [isCollapsed, setIsCollapsed] = useState(collapsedByDefault);

	const toggleCollapsed = () => {
		if (collapsible) {
			setIsCollapsed(!isCollapsed);
		}
	};

	return (
		<div className="border rounded-md p-4 space-y-2">
			<SectionHeader
				title={title}
				text={isCollapsed && hintText ? hintText : undefined}
				collapsible={collapsible}
				isCollapsed={isCollapsed}
				onToggle={toggleCollapsed}
			/>
			{!isCollapsed && <div>{children}</div>}
		</div>
	);
};

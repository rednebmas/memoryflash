import React, { useState } from 'react';
import { SectionHeader } from '../layout/SectionHeader';
import { Card } from '../ui/Card';

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
		<Card className="w-full" contentContainerClassName="space-y-2">
			<SectionHeader
				title={title}
				text={isCollapsed && hintText ? hintText : undefined}
				collapsible={collapsible}
				isCollapsed={isCollapsed}
				onToggle={toggleCollapsed}
			/>
			{!isCollapsed && <div>{children}</div>}
		</Card>
	);
};

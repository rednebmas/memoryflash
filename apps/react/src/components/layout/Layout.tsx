import clsx from 'clsx';
import React from 'react';
import { Navbar } from './Navbar';
import { BugReportButton } from '../bugReport/BugReportButton';

interface LayoutProps {
	children: React.ReactNode;
	right?: React.ReactNode;
	subtitle?: string;
	contentClassName?: string;
	back?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, right, contentClassName, back }) => {
	return (
		<div className="h-full w-full flex flex-col bg-app">
			<Navbar right={right} back={back} />
			<div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
				<div
					className={clsx(
						'mx-auto max-w-4xl pt-4 sm:p-6 lg:p-8 flex flex-col flex-1 w-full',
						contentClassName,
					)}
				>
					<div className="space-y-8 flex flex-col flex-1">{children}</div>
				</div>
			</div>
			<BugReportButton />
		</div>
	);
};

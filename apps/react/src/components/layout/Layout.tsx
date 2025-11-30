import clsx from 'clsx';
import React from 'react';
import { Navbar } from './Navbar';

interface LayoutProps {
	children: React.ReactNode;
	right?: React.ReactNode;
	onScroll?: (e: React.UIEvent<HTMLDivElement, UIEvent>) => void;
	subtitle?: string;
	contentClassName?: string;
	back?: string;
}

export const Layout: React.FC<LayoutProps> = ({
	children,
	onScroll = () => {},
	right,
	contentClassName,
	back,
}) => {
	return (
		<div className="h-screen w-full flex flex-col overflow-scroll bg-app" onScroll={onScroll}>
			<Navbar right={right} back={back} />
			<div
				className={clsx(
					'mx-auto max-w-4xl pt-4 sm:p-6 lg:p-8 flex flex-col flex-1 w-full',
					contentClassName,
				)}
			>
				<div className="space-y-8 flex flex-col flex-1">{children}</div>
			</div>
		</div>
	);
};

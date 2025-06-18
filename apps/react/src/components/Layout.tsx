import { ChevronLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CircleHover } from './CircleHover';
import { MidiInputsDropdown } from './MidiInputsDropdown';
import { AccountNavButton } from './navigation/AccountNavButton';
import { isIOSDebug } from '../utils/isIOSDebug';
import { ConsoleErrorsButton } from './ConsoleErrorsButton';

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
	subtitle,
	contentClassName,
	back,
}) => {
	const navigate = useNavigate();
	const location = useLocation();
	const iosDebug = isIOSDebug();
	const rightContent = right || (
		<>
			<AccountNavButton />
			<MidiInputsDropdown />
		</>
	);

	return (
		<div className="mx-auto h-screen w-full flex flex-col overflow-scroll " onScroll={onScroll}>
			<div className="pt-6 grid grid-cols-3 mx-6">
				<div className="flex items-center">
					{location.pathname !== '/' &&
						(back ? (
							<Link to={back}>
								<CircleHover>
									<ChevronLeftIcon className="w-6 h-6 stroke-2" />
								</CircleHover>
							</Link>
						) : (
							<CircleHover onClick={() => navigate(-1)}>
								<ChevronLeftIcon className="w-6 h-6 stroke-2" />
							</CircleHover>
						))}
				</div>
				<div className="text-2xl mx-auto font-medium flex flex-col text-center">
					<Link to="/">MFlash</Link>
					<span className="text-xs">{subtitle}</span>
				</div>
				<div className="flex flex-row-reverse items-center gap-3">
					{rightContent}
					{iosDebug && (
						<>
							<ConsoleErrorsButton />
							<CircleHover onClick={() => window.location.reload()}>
								<ArrowPathIcon className="w-6 h-6 stroke-2" />
							</CircleHover>
						</>
					)}
				</div>
			</div>
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

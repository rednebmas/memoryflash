import { ChevronLeftIcon, ArrowPathIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CircleHover } from '../ui/CircleHover';
import { MidiInputsDropdown } from '../MidiInputsDropdown';
import { AccountNavButton } from '../navigation/AccountNavButton';
import { isIOSDebug } from '../../utils/isIOSDebug';
import { ConsoleErrorsButton } from '../ConsoleErrorsButton';
import { StreakChip } from '../StreakChip';

interface NavbarProps {
	right?: React.ReactNode;
	back?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ right, back }) => {
	const navigate = useNavigate();
	const location = useLocation();
	const iosDebug = isIOSDebug();
	const showBackButton = location.pathname !== '/';

	return (
		<nav className="sticky top-0 z-40 pt-4 px-4 bg-app">
			<div className="mx-auto max-w-[1200px] h-[52px] flex items-center justify-between px-4 rounded-xl border border-default bg-lm-surface dark:bg-dm-bg">
				<div className="flex items-center gap-2">
					{showBackButton && <BackButton back={back} onBack={() => navigate(-1)} />}
					<Link to="/" className="text-xl font-semibold text-fg">
						MFlash
					</Link>
				</div>
				<div className="flex items-center gap-2">
					<StreakChip />
					{right}
					<CircleHover link="/community">
						<GlobeAltIcon className="w-5 h-5 stroke-2" />
					</CircleHover>
					<AccountNavButton />
					<MidiInputsDropdown />
					{iosDebug && <IOSDebugButtons />}
				</div>
			</div>
		</nav>
	);
};

const BackButton: React.FC<{ back?: string; onBack: () => void }> = ({ back, onBack }) => {
	if (back) {
		return (
			<Link to={back}>
				<CircleHover>
					<ChevronLeftIcon className="w-5 h-5 stroke-2" />
				</CircleHover>
			</Link>
		);
	}
	return (
		<CircleHover onClick={onBack}>
			<ChevronLeftIcon className="w-5 h-5 stroke-2" />
		</CircleHover>
	);
};

const IOSDebugButtons: React.FC = () => (
	<>
		<ConsoleErrorsButton />
		<CircleHover onClick={() => window.location.reload()}>
			<ArrowPathIcon className="w-5 h-5 stroke-2" />
		</CircleHover>
	</>
);

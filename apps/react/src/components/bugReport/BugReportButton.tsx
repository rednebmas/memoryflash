import React from 'react';
import { BugAntIcon } from '@heroicons/react/24/outline';
import { authSelector } from 'MemoryFlashCore/src/redux/selectors/authSelector';
import { useAppSelector } from 'MemoryFlashCore/src/redux/store';
import { BugReportModal } from './BugReportModal';
import { captureScreenshot } from './captureScreenshot';

export const BugReportButton: React.FC = () => {
	const authed = useAppSelector(authSelector) === 'Authenticated';
	const [screenshot, setScreenshot] = React.useState<string>();
	const [open, setOpen] = React.useState(false);

	if (!authed) return null;

	const openReport = async () => {
		setScreenshot(await captureScreenshot());
		setOpen(true);
	};

	return (
		<>
			<button
				type="button"
				aria-label="Report a bug"
				data-bug-report-ignore="true"
				onClick={openReport}
				className="fixed bottom-4 left-4 z-50 rounded-full bg-surface border border-default p-2 shadow-md text-muted hover:text-fg opacity-70 hover:opacity-100 transition"
			>
				<BugAntIcon className="w-5 h-5" />
			</button>
			{open && <BugReportModal screenshot={screenshot} onClose={() => setOpen(false)} />}
		</>
	);
};

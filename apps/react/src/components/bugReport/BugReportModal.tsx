import React from 'react';
import { submitBugReport } from 'MemoryFlashCore/src/redux/actions/submit-bug-report-action';
import { useNetworkState } from 'MemoryFlashCore/src/redux/selectors/useNetworkState';
import { useAppDispatch } from 'MemoryFlashCore/src/redux/store';
import { getConsoleErrors } from '../../utils/consoleErrors';
import { diagnostics } from '../../utils/diagnostics';
import { useToast } from '../feedback/Toast';
import { BaseTextArea } from '../inputs/BaseTextArea';
import { Modal } from '../modals/Modal';
import { ModalButtons } from '../modals/ModalButtons';

interface BugReportModalProps {
	screenshot?: string;
	onClose: () => void;
}

const reportContext = () => ({
	url: window.location.href,
	userAgent: navigator.userAgent,
	viewport: `${window.innerWidth}x${window.innerHeight}`,
	appVersion: __APP_VERSION__,
	consoleErrors: [...getConsoleErrors(), ...diagnostics.entries()],
});

export const BugReportModal: React.FC<BugReportModalProps> = ({ screenshot, onClose }) => {
	const dispatch = useAppDispatch();
	const toast = useToast();
	const { isLoading, error } = useNetworkState('submitBugReport');
	const [description, setDescription] = React.useState('');
	const [includeShot, setIncludeShot] = React.useState(true);

	const submit = () => {
		const payload = {
			...reportContext(),
			description,
			screenshot: includeShot ? screenshot : undefined,
		};
		dispatch(
			submitBugReport(payload, () => {
				toast('Report sent — thanks!');
				onClose();
			}),
		);
	};

	return (
		<Modal isOpen onClose={onClose} title="Report a bug">
			<div className="px-6 pt-4 space-y-3" data-bug-report-ignore="true">
				<BaseTextArea
					autoFocus
					placeholder="What went wrong? What did you expect?"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
				/>
				{screenshot && (
					<label className="flex items-center gap-3 text-sm text-fg">
						<input
							type="checkbox"
							checked={includeShot}
							onChange={(e) => setIncludeShot(e.target.checked)}
						/>
						<img
							src={screenshot}
							alt="Screenshot"
							className="h-16 rounded border border-default"
						/>
						Include screenshot
					</label>
				)}
				{error && <p className="text-sm text-red-600">{error}</p>}
			</div>
			<ModalButtons
				onCancel={onClose}
				onConfirm={submit}
				confirmText={isLoading ? 'Sending…' : 'Send'}
				confirmDisabled={isLoading || !description.trim()}
			/>
		</Modal>
	);
};

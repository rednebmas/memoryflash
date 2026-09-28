import { AppThunk } from '../store';
import { networkCallWithReduxState } from '../util/networkStateHelper';

export type BugReportPayload = {
	description: string;
	url: string;
	userAgent: string;
	viewport: string;
	appVersion: string;
	consoleErrors: string[];
	screenshot?: string;
};

export const submitBugReport =
	(payload: BugReportPayload, onSuccess: () => void): AppThunk =>
	async (dispatch, _, { api }) => {
		await networkCallWithReduxState(
			dispatch,
			'submitBugReport',
			async () => {
				await api.post('/bug-reports', payload);
			},
			{ successCb: onSuccess },
		);
	};

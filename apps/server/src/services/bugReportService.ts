import { BugReport, BugReportStatus } from '../models/BugReport';

export type BugReportInput = {
	description: string;
	url?: string;
	userAgent?: string;
	viewport?: string;
	appVersion?: string;
	consoleErrors?: string[];
	screenshot?: string;
};

type Reporter = { _id: string; email: string };

const MAX_TEXT = 10000;
const MAX_ERRORS = 30;
const MAX_SCREENSHOT = 1_500_000;

export const isAdminEmail = (email: string) =>
	(process.env.ADMIN_EMAILS ?? '')
		.split(',')
		.map((e) => e.trim().toLowerCase())
		.filter(Boolean)
		.includes(email.toLowerCase());

const clip = (value: string | undefined, max = MAX_TEXT) => (value ?? '').slice(0, max);

export const fileBugReport = async (user: Reporter, input: BugReportInput) => {
	const screenshot = input.screenshot?.slice(0, MAX_SCREENSHOT);
	return BugReport.create({
		userId: user._id,
		email: user.email,
		admin: isAdminEmail(user.email),
		description: clip(input.description),
		url: clip(input.url, 2000),
		userAgent: clip(input.userAgent, 1000),
		viewport: clip(input.viewport, 50),
		appVersion: clip(input.appVersion, 100),
		consoleErrors: (input.consoleErrors ?? []).slice(-MAX_ERRORS).map((e) => clip(e, 2000)),
		screenshot,
	});
};

export const claimBugReport = (id: string, branch: string) =>
	BugReport.findOneAndUpdate(
		{ _id: id, status: 'new' },
		{ status: 'building', agent: { startedAt: new Date(), branch } },
		{ new: true },
	);

export const setBugReportStatus = (id: string, status: BugReportStatus, commit?: string) =>
	BugReport.findByIdAndUpdate(
		id,
		{ status, ...(commit ? { 'agent.commit': commit } : {}) },
		{ new: true, runValidators: true },
	);

export const addBugReportComment = (id: string, text: string) =>
	BugReport.findByIdAndUpdate(
		id,
		{ $push: { comments: { at: new Date(), text } } },
		{ new: true },
	);

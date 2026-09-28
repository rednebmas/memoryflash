import { Document, Schema, model, Types } from 'mongoose';

export const BUG_REPORT_STATUSES = [
	'new',
	'building',
	'fixed',
	'shipped',
	'proposed-close',
	'failed',
	'wont-fix',
] as const;
export type BugReportStatus = (typeof BUG_REPORT_STATUSES)[number];

export type BugReportComment = { at: Date; text: string };

export type BugReportAgent = {
	startedAt?: Date;
	branch?: string;
	commit?: string;
};

export type BugReportDoc = Document & {
	userId: Types.ObjectId;
	email: string;
	admin: boolean;
	description: string;
	url: string;
	userAgent: string;
	viewport: string;
	appVersion: string;
	consoleErrors: string[];
	screenshot?: string;
	status: BugReportStatus;
	agent: BugReportAgent;
	comments: BugReportComment[];
	createdAt: Date;
	updatedAt: Date;
};

const bugReportSchema = new Schema<BugReportDoc>(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		email: { type: String, required: true },
		admin: { type: Boolean, default: false, index: true },
		description: { type: String, required: true },
		url: { type: String, default: '' },
		userAgent: { type: String, default: '' },
		viewport: { type: String, default: '' },
		appVersion: { type: String, default: '' },
		consoleErrors: { type: [String], default: [] },
		screenshot: { type: String, select: false },
		status: { type: String, enum: BUG_REPORT_STATUSES, default: 'new', index: true },
		agent: {
			startedAt: Date,
			branch: String,
			commit: String,
		},
		comments: {
			type: [new Schema<BugReportComment>({ at: Date, text: String }, { _id: false })],
			default: [],
		},
	},
	{ timestamps: true },
);

export const BugReport = model<BugReportDoc>('BugReport', bugReportSchema);
